import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import {
  MpParseError,
  parseMolecularProfile,
} from '@app/core/utilities/molecular-profile-parser'
import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Maybe,
  MolecularProfile,
  Variant,
} from '@app/generated/civic.apollo.types'
import { tagSpecFor } from '@app/tags'
import { lastValueFrom, EMPTY, Observable, Subject, debounceTime, map, of, switchMap, catchError, filter } from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators/pluck'
import {
  CreateMolecularProfile2GQL,
  MpExpressionEditorPrepopulateGQL,
  PreviewMolecularProfileName2GQL,
  PreviewMpName2Fragment,
} from './mp-expression-editor.query.gql.generated'

type AppendableValue = 'AND' | 'OR' | 'NOT' | '(' | ')'
type AppendVariant = { variant: Variant; prependNot: boolean }
type ExampleExpression = {
  /** illustrative only — these profiles do not exist, so they are not tagged */
  name: string
  expression: string
  description: string
}

/** everything the alerts, preview, and action buttons derive from */
type PreviewState =
  | { kind: 'initial' }
  | { kind: 'error'; error: MpParseError }
  | {
      kind: 'preview'
      segments: PreviewMpName2Fragment[]
      existingMp: Maybe<MolecularProfile>
    }

const INITIAL_MESSAGE = 'Use the editor below to construct a molecular profile.'

@Component({
  selector: 'cvc-mp-expression-editor',
  templateUrl: './mp-expression-editor.component.html',
  styleUrls: ['./mp-expression-editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MpExpressionEditorComponent implements OnChanges {
  private formMutation = inject(FormMutationService)
  private previewMpGql = inject(PreviewMolecularProfileName2GQL)
  private createMolecularProfileGql = inject(CreateMolecularProfile2GQL)
  private mpEditorPrepopulate = inject(MpExpressionEditorPrepopulateGQL)
  private viewerService = inject(ViewerService)

  @Input() cvcPrepopulateWithId: Maybe<number>
  @Output() cvcOnSelect = new EventEmitter<MolecularProfile>()

  state?: FormMutationState

  /** single home for the expression text; the textarea two-way binds to it */
  readonly inputValue = signal('')

  // the one true event stream: debounce sequences keystrokes, switchMap
  // cancels the in-flight preview when a newer input arrives
  private onInputChange$ = new Subject<string>()

  private previewState = toSignal(
    this.onInputChange$.pipe(
      debounceTime(250),
      switchMap((input): Observable<PreviewState> => {
        if (input.length === 0) return of({ kind: 'initial' } as const)
        // mid-expression pause — keep whatever is displayed
        if (input.endsWith(' ')) return EMPTY
        const res = parseMolecularProfile(input)
        if ('errorMessage' in res) return of({ kind: 'error', error: res })
        return this.previewMpGql
          .fetch({
            variables: { mpStructure: res },
            fetchPolicy: 'network-only',
          })
          .pipe(
            map(({ data }): Maybe<PreviewState> => {
              const preview = data?.previewMolecularProfileName
              if (!preview) return undefined
              return {
                kind: 'preview',
                segments: preview.segments,
                existingMp: preview.existingMolecularProfile as Maybe<MolecularProfile>,
              }
            }),
            filter(isNonNulled),
            // AC4 rejects on GraphQL errors — this is the queryError channel
            catchError((error): Observable<PreviewState> =>
              of({
                kind: 'error',
                error: {
                  errorType: 'queryError',
                  errorMessage: CombinedGraphQLErrors.is(error)
                    ? error.errors.map((e) => e.message).join('\n')
                    : (error?.message ?? String(error)),
                },
              })
            )
          )
      })
    ),
    { initialValue: { kind: 'initial' } as PreviewState }
  )

  readonly expressionMessage = computed(() =>
    this.previewState().kind === 'initial' ? INITIAL_MESSAGE : undefined
  )
  readonly expressionError = computed(() => {
    const s = this.previewState()
    return s.kind === 'error' ? s.error : undefined
  })
  readonly expressionSegment = computed(() => {
    const s = this.previewState()
    return s.kind === 'preview' ? s.segments : undefined
  })
  readonly existingMp = computed(() => {
    const s = this.previewState()
    return s.kind === 'preview' ? (s.existingMp ?? undefined) : undefined
  })
  /** the found/create alert row renders only for a live preview */
  readonly showMpActions = computed(() => this.previewState().kind === 'preview')

  private mostRecentOrg = toSignal(
    this.viewerService.viewer$.pipe(pluck('mostRecentOrg'))
  )

  /** same source of truth the real MP tags use */
  readonly mpColor = tagSpecFor('MolecularProfile').color

  exampleExpressions: ExampleExpression[] = [
    {
      name: 'BRAF V600E AND EGFR L858R AND EGFR T790M',
      expression: '#VID12 AND #VID33 AND #VID34',
      description:
        'BRAF V600E, EGFR L858R, and EGFR T790M must all be observed.',
    },
    {
      name: 'BRAF V600E AND NOT EGFR L858R',
      expression: '#VID12 AND NOT #VID33',
      description: 'BRAF V600E must be observed and EGFR L858R must be absent.',
    },
    {
      name: 'BRAF V600E OR EGFR L858R OR EGFR T790M',
      expression: '#VID12 OR #VID33 OR #VID34',
      description:
        'Either BRAF V600E, or EGFR L858R, or EGFR T790M must be observed.',
    },
    {
      name: 'BRAF V600E AND (EGFR L858R OR EGFR T790M)',
      expression: '#VID12 AND (#VID33 OR #VID34)',
      description:
        'BRAF V600E must be observed and either EGFR L858R or EGFR T790M must be observed.',
    },
    {
      name: 'NOT KIT D816V',
      expression: 'NOT #VID4353',
      description: 'KIT D816V must be absent.',
    },
  ]

  onInput(value: string): void {
    this.inputValue.set(value)
    this.onInputChange$.next(value)
  }

  appendInput(append: AppendableValue): void {
    const current = this.inputValue()
    this.onInput(`${current}${/\s$/.test(current) || !current ? append : ' ' + append}`)
  }

  selectExample(example: ExampleExpression): void {
    this.onInput(example.expression)
  }

  selectVariant({ variant, prependNot }: AppendVariant): void {
    const input = this.inputValue()
    const newVariant = `${prependNot ? 'NOT ' : ''}#VID${variant.id}`
    if (!input || input.trim().length == 0) {
      this.onInput(newVariant)
    } else {
      const [prevVariant] = input.trim().split(' ').slice(-1)
      if (prevVariant == newVariant) {
        this.onInput(input.trim())
      } else {
        this.onInput(`${input.trim()} ${newVariant}`)
      }
    }
  }

  createNewMp(): void {
    const input = this.inputValue()
    if (!input || input.length === 0) return
    const res = parseMolecularProfile(input)
    if ('errorMessage' in res) return
    this.state = this.formMutation.mutate(
      this.createMolecularProfileGql,
      { mpStructure: res, organizationId: this.mostRecentOrg()?.id },
      {},
      (data) => {
        setTimeout(() => {
          if (data.createMolecularProfile) {
            this.cvcOnSelect.next(
              data.createMolecularProfile.molecularProfile as MolecularProfile
            )
          }
        }, 1000)
      }
    )
  }

  prepopulateMp(mpId: Maybe<number>) {
    if (!mpId) {
      this.onInput('')
      return
    }

    lastValueFrom(
      this.mpEditorPrepopulate.fetch({
        variables: { mpId: mpId },
        fetchPolicy: 'cache-first',
      })
    ).then(({ data }) => {
      if (!data?.molecularProfile?.id) {
        console.error(
          `MpExpressionEditor could not fetch MolecularProfile:${mpId} to prepolate editor fields.`
        )
        return
      }

      const input = data.molecularProfile.rawName
        .replace(/#GID(\d+)/g, '')
        .trim()
      this.onInput(input)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cvcPrepopulateWithId) {
      const id = changes.cvcPrepopulateWithId.currentValue
      this.prepopulateMp(id)
    }
  }
}
