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
  VariantInputLinkableVariantGQL,
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
import { tag } from 'rxjs-spy/operators'

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

export const GET_CACHED_VARIANT = gql`
  fragment LinkablelGene on Gene {
    id
    name
    link
  }
`

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
  // field interactions
  state: Maybe<EvidenceState>
  // receive geneId updates from state
  geneId$!: Subject<Maybe<number>>

  // SOURCE STREAMS
  onSearch$: Subject<string>
  onSelect$: Subject<Maybe<number>>
  onValueChange$: Subject<Maybe<number>>
  onTagClose$: Subject<MouseEvent>
  tagCacheId$: Subject<Maybe<string>>

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<VariantInputTypeaheadQuery>>

  // DISPLAY STREAMS
  placeholder$!: BehaviorSubject<string>
  result$!: Observable<VariantInputTypeaheadFieldsFragment[]>
  isLoading$!: Observable<boolean>

  queryRef!: QueryRef<
    VariantInputTypeaheadQuery,
    VariantInputTypeaheadQueryVariables
  >

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search CIViC Variants',
      requireGene: true,
      requireGenePlaceholder: 'Search GENE_NAME Variants',
      requireGenePrompt: 'Select a Gene to search Variants',
    },
  }

  constructor(
    private gql: VariantInputTypeaheadGQL,
    private entityQuery: VariantInputLinkableVariantGQL,
    private apollo: Apollo
  ) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onSelect$ = new Subject<Maybe<number>>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.onValueChange$ = new Subject<Maybe<number>>()
    this.tagCacheId$ = new Subject<Maybe<string>>()
  }

  private onGeneId(gid: Maybe<number>): void {
    // if field config indicates that a geneId is required, and none is provided
    // set model to undefined (this resets the variant model if gene field is reset)
    // and update the placeholder message
    if (!gid && this.props.requireGene) {
      this.formControl.setValue(undefined)
      this.placeholder$.next(this.props.requireGenePrompt)
      return
    }
    // if geneId is provided, get gene name from cache
    // since formState's geneId$ will only emit when a geneId field is updated,
    // we can assume that it is cached, and omit checking & fetching here
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
    if (!name) {
      console.error(`variant-input could not find cached Gene:${gid}`)
      return
    }
    // format require gene msg
    const ph = this.props.requireGenePlaceholder.replace('GENE_NAME', name)
    this.placeholder$.next(ph)
  }

  ngAfterViewInit(): void {
    // show prompt to select a gene if requireGene true
    // otherwise show standard placeholder
    const initialPlaceholder = this.props.requireGene
      ? this.props.requireGenePrompt
      : this.props.placeholder
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

    // find formState's geneId$ subject, subscribe to call onGeneId for new events
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

    // on value change, fetch linkable entity from cache, or query server
    this.onValueChange$.subscribe((vid: Maybe<number>) => {
      this.setTag(vid)
    })

    // if field has been assigned a value before its initialization, fire
    // emit geneId$ and onValueChange$ events to notify other fields and fetch
    // the tag's linkable entity
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      // TODO: get variantId$ from formState and emit field updates
      // if (this.variantId$) this.variantId$.next(v)
      if (this.onValueChange$) this.onValueChange$.next(v)
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

    // watch for value changes
    this.formControl.valueChanges
      .pipe(tag('variant-input valueChanges'), untilDestroyed(this))
      .subscribe((vid?: number) => this.onValueChange$.next(vid))

    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      filter(isNonNulled),
      distinctUntilChanged()
    )
    this.result$ = this.response$.pipe(
      pluck('data', 'variants', 'nodes'),
      filter(isNonNulled)
    )

    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.setTag(undefined)
    })
  } // ngAfterViewInit

  setTag(vid?: number) {
    if (!vid) {
      this.tagCacheId$.next(undefined)
      return
    }
    const cacheId = `Variant:${vid}`
    // linkable variant from cache
    const fragment = {
      id: cacheId,
      fragment: GET_CACHED_VARIANT,
    }
    const cachedVariant = this.apollo.client.readFragment(
      fragment
    ) as LinkableVariant
    if (cachedVariant) {
      this.tagCacheId$.next(cacheId)
    } else {
      console.log(
        `variant-input field could not find cached Variant:${vid}, fetching.`
      )
      this.entityQuery.fetch({ variantId: vid }).subscribe(({ data }) => {
        const fetchedVariant = data.variant
        if (fetchedVariant) {
          this.tagCacheId$.next(cacheId)
        } else {
          console.error(
            `variant-input field could not find cached Variant:${vid}, or fetch it from the server.`
          )
        }
      })
    }
  }
}
