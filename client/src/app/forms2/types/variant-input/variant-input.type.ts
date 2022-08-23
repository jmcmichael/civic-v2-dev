import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  LinkableVariant,
  Maybe,
  VariantInputTypeaheadFieldsFragment,
  VariantInputTypeaheadGQL,
  VariantInputTypeaheadQuery,
  VariantInputTypeaheadQueryVariables,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { Apollo, gql, QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
  BehaviorSubject,
  defer,
  distinctUntilChanged,
  filter,
  from,
  iif,
  Observable,
  Subject,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'

interface CvcVariantInputFieldProps extends FormlyFieldProps {
  placeholder: string // default placeholder
  requireGene: boolean // if true, disables field if no geneId$
  requireGenePlaceholder: string // placeholder if geneId required & none is set
  requireGenePrompt: string // placeholder prompt displayed when geneId set
}

export interface CvcVariantInputFieldConfig
  extends FormlyFieldConfig<CvcVariantInputFieldProps> {
  type: 'variant-input' | Type<CvcVariantInputField>
}
@UntilDestroy()
@Component({
  selector: 'cvc-variant-input',
  templateUrl: './variant-input.type.html',
  styleUrls: ['./variant-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantInputField
  extends FieldType<FieldTypeConfig<CvcVariantInputFieldProps>>
  implements AfterViewInit
{
  // store linkable entity for tag display
  tag: Maybe<LinkableVariant>

  // field interactions
  state: Maybe<EvidenceState>
  geneId$!: Subject<Maybe<number>>

  // SOURCE STREAMS
  onSearch$: Subject<string>
  onSelect$: Subject<Maybe<number>>
  queryRef!: QueryRef<
    VariantInputTypeaheadQuery,
    VariantInputTypeaheadQueryVariables
  >

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<VariantInputTypeaheadQuery>>

  // DISPLAY STREAMS
  placeholder$!: BehaviorSubject<string>
  result$!: Observable<VariantInputTypeaheadFieldsFragment[]>
  isLoading$!: Observable<boolean>

  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search CIViC Variants',
      requireGene: true,
      requireGenePlaceholder: 'Search GENE_NAME Variants',
      requireGenePrompt: 'Select a Gene to search Variants',
    },
  }

  constructor(private gql: VariantInputTypeaheadGQL, private apollo: Apollo) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onSelect$ = new Subject<Maybe<number>>()
  }

  private onGeneId(gid: Maybe<number>): void {
    if (!gid && this.props.requireGene) {
      this.formControl.setValue(undefined)
      this.placeholder$.next(this.props.requireGenePrompt)
      return
    }
    // get gene name
    const fragment = {
      id: `Gene:${gid}`,
      fragment: gql`
        fragment GeneName on Gene {
          name
        }
      `,
    }
    const { name } = this.apollo.client.readFragment(fragment) as {
      name: string
    }
    if (!name) console.error(`variant-input could not find cached Gene:${gid}`)
    // format require gene msg
    const ph = this.props.requireGenePlaceholder.replace('GENE_NAME', name)
    this.placeholder$.next(ph)
  }

  ngAfterViewInit(): void {
    // show prompt to select a gene if requireGene true
    const initialPlaceholder = this.props.requireGene
      ? this.props.requireGenePrompt
      : this.props.placeholder
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

    // find and assign geneId on formState.fields
    if (this.field.options?.formState) {
      this.state = this.field.options.formState
      if (this.state && this.state.fields.geneId$) {
        this.geneId$ = this.state.fields.geneId$
        this.geneId$
          .pipe(untilDestroyed(this))
          .subscribe((gid) => this.onGeneId(gid))
      } else {
        if (this.props.requireGene) {
          console.error(
            `variant-input field requires a gene to be set, but could not find a geneId$  formState fields.`
          )
        }
      }
    }
    // set up typeahead watch, fetch calls
    this.response$ = this.onSearch$.pipe(
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      withLatestFrom(this.geneId$),
      filter(([str, geneId]: [string, Maybe<number>]) => {
        // if gene required, filter events w/o a geneId provided
        return !!this.props.requireGene && !!geneId
      }),
      switchMap(([str, geneId]: [string, Maybe<number>]) => {
        const query: VariantInputTypeaheadQueryVariables = {
          name: str,
          geneId: geneId,
        }
        // helper functions for iif operator:
        const watchQuery = (query: VariantInputTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.gql.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: VariantInputTypeaheadQueryVariables) => {
          // returns observable from refetch() promise
          return from(this.queryRef.refetch(query))
        }

        // this iif operator prevents double-calling the API:
        // if queryRef doesn't exist, create it with watchQuery observable
        // if it does, refetch with fetchQuery observable.
        // using defer() ensures functions are not called until
        // values are emitted. otherwise they'll be called on subscribe.
        return iif(
          () => this.queryRef === undefined, // predicate
          defer(() => watchQuery(query)), // true
          defer(() => fetchQuery(query)) // false
        )
      })
    ) // end this.response$
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      filter(isNonNulled),
      distinctUntilChanged()
    )
    this.result$ = this.response$.pipe(
      pluck('data', 'variants', 'nodes'),
      filter(isNonNulled)
    )
  }
}
