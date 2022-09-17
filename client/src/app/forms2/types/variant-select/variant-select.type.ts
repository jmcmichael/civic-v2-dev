import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  LinkableVariant,
  Maybe,
  LinkableVariantGQL,
  LinkableGeneGQL,
  VariantSelect2Query,
  VariantSelect2FieldsFragment,
  VariantSelect2QueryVariables,
  VariantSelect2GQL,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { FormlyValueChangeEvent } from '@ngx-formly/core/lib/models'
import { Apollo, gql, QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
  BehaviorSubject,
  defer,
  distinctUntilChanged,
  filter,
  from,
  iif,
  lastValueFrom,
  Observable,
  Subject,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

export interface CvcVariantSelectFieldProps extends FormlyFieldProps {
  placeholder: string // default placeholder
  isRepeatItem: boolean // is child of a repeat-field type
  requireGene: boolean // if true, disables field if no geneId$
  requireGenePlaceholder?: string // placeholder if geneId required & none is set
  requireGenePrompt?: string // placeholder prompt displayed when geneId set
}

export interface CvcVariantSelectFieldConfig
  extends FormlyFieldConfig<CvcVariantSelectFieldProps> {
  type: 'variant-select' | 'variant-select-item' | Type<CvcVariantSelectField>
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
  selector: 'cvc-variant-select',
  templateUrl: './variant-select.type.html',
  styleUrls: ['./variant-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantSelectField
  extends FieldType<FieldTypeConfig<CvcVariantSelectFieldProps>>
  implements AfterViewInit
{
  // field interactions
  state: Maybe<EvidenceState>
  // receive geneId updates from state
  onGeneId$!: BehaviorSubject<Maybe<number>>
  // send variantId updates to state
  variantId$!: Subject<Maybe<number>>

  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<number>> // emits all field model changes
  onValueChange$: Subject<Maybe<number>>
  onFocus$: Subject<boolean>
  onSearch$: Subject<string>
  onTagClose$: Subject<MouseEvent>

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<VariantSelect2Query>>

  // PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>
  result$!: Observable<VariantSelect2FieldsFragment[]>
  isLoading$!: Observable<boolean>
  tagCacheId$: Subject<Maybe<string>>

  queryRef!: QueryRef<VariantSelect2Query, VariantSelect2QueryVariables>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcVariantSelectFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search CIViC Variants',
      requireGene: true,
      requireGenePlaceholder: 'Search GENE_NAME Variants',
      requireGenePrompt: 'Select a Gene to search Variants',
      isRepeatItem: false,
    },
  }

  repeatFieldKey?: string

  constructor(
    private typeaheadGQL: VariantSelect2GQL,
    private tagQuery: LinkableVariantGQL,
    private geneQuery: LinkableGeneGQL,
    private apollo: Apollo
  ) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onFocus$ = new Subject<boolean>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.onValueChange$ = new Subject<Maybe<number>>()
    this.tagCacheId$ = new Subject<Maybe<string>>()
  }

  ngAfterViewInit(): void {
    // if this is a repeat-field item, store parent repeat-field key
    // to use in field changes filter
    if (this.props.isRepeatItem) {
      if (!this.field.parent?.id) {
        console.error(
          `base-input field is configured as a repeat-field item, but could not locate a parent key.`
        )
      } else {
        this.repeatFieldKey = this.field.parent.id
      }
    }

    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.key} field could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        // tag(`variant-select ${this.field.id} onModelChange$`),
        filter((c) => c.field.id === this.field.id), // filter out other fields
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        this.onValueChange$.next(v)
      })
    }

    // show prompt to select a gene if requireGene true
    // otherwise show standard placeholder
    let initialPlaceholder: string
    if (this.props.requireGene && this.props.requireGenePrompt) {
      initialPlaceholder = this.props.requireGenePrompt
    } else {
      initialPlaceholder = this.props.placeholder
    }
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

    // if this is a repeat-item, attach dummy state fields that emit
    // undefined, so that response$ query's withLatestFrom succeeds
    if (this.props.isRepeatItem) {
      this.onGeneId$ = new BehaviorSubject<Maybe<number>>(undefined)
    } else {
      // find formState's geneId$ subject, subscribe to call onGeneId for new events
      if (this.field.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.geneId$) {
          this.onGeneId$ = this.state.fields.geneId$
          this.onGeneId$.pipe(untilDestroyed(this)).subscribe((gid) => {
            this.onGeneId(gid)
          })
        } else {
          if (this.props.requireGene) {
            console.error(
              `variant-input ${this.field.id} requireGene is true, but could not find a geneId$ on formState.field.`
            )
          }
        }
      }

      // get variantId$ reference from state, subscribe to field value changes
      // and emit new variantIds from formState's variantId$
      if (this.field?.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.variantId$) {
          this.variantId$ = this.state.fields.variantId$
          if (this.variantId$ && this.field.options?.fieldChanges) {
            this.field.options.fieldChanges
              .pipe(
                filter((c) => c.field.id === this.field.id), // filter out other fields
                untilDestroyed(this)
              )
              .subscribe((change) => {
                this.variantId$!.next(change.value)
              })
          }
        }
      }
    }

    // on value change, fetch linkable entity from cache, or query server
    this.onValueChange$.subscribe((vid: Maybe<number>) => {
      if (!vid) {
        this.deleteTag()
      } else {
        this.setTag(vid)
      }
    })

    // if field has been assigned a value before its initialization, fire
    // emit geneId$ and onValueChange$ events to notify other fields and fetch
    // the tag's linkable entity
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      if (this.onValueChange$) this.onValueChange$.next(v)
    }

    // perform a query with an empty string to show a list of variants
    // when selector clicked
    this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.onSearch$.next('')
    })

    // set up typeahead watch, fetch calls
    this.response$ = this.onSearch$.pipe(
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      tag(`${this.field.id} response$`),
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      withLatestFrom(this.onGeneId$),
      switchMap(([str, geneId]: [string, Maybe<number>]) => {
        const query: VariantSelect2QueryVariables = {
          name: str,
          geneId: geneId,
        }
        // helper functions for iif operator:
        const watchQuery = (query: VariantSelect2QueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.typeaheadGQL.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: VariantSelect2QueryVariables) => {
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
      }),
      tag(`${this.field.id} response$`)
    ) // end this.response$

    // BUG: isLoading returns true a couple of times then false thereafter
    // for no good reason that I can determine
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      // tag('variant-input isloading$'),
      distinctUntilChanged()
    )

    this.result$ = this.response$.pipe(
      pluck('data', 'variants', 'nodes'),
      filter(isNonNulled)
    )

    // if this field is the child of a repeat-field type,
    // get reference to its onRemove$ and emit its ID when tag closed,
    // otherwise, handle model reset and tag deletion locally
    if (this.props.isRepeatItem) {
      // check if parent field is of 'repeat-field' type
      if (!(this.field.parent && this.field.parent?.type === 'repeat-field')) {
        console.error(
          `${this.field.id} field does not appear to have a parent type of 'repeat-field'.`
        )
      } else {
        // check if parent repeat-field attached the onRemove$ Subject
        if (!this.field.parent?.props?.onRemove$) {
          console.error(
            `${this.field.id} field cannot find reference to parent repeat-field onRemove$.`
          )
        } else {
          const onRemove$: Subject<number> = this.field.parent.props.onRemove$
          this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
            this.resetField()
            onRemove$.next(Number(this.key))
          })
        }
      }
    } else {
      this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
        this.resetField()
      })
    }
  } // ngAfterViewInit

  private onGeneId(gid: Maybe<number>): void {
    // if field config indicates that a geneId is required, and none is provided,
    // set model to undefined (this resets the variant model if gene field is reset)
    // and update the placeholder message
    if (!gid && this.props.requireGene && this.props.requireGenePrompt) {
      this.resetField()
      this.placeholder$.next(this.props.requireGenePrompt)
    } else if (gid) {
      // we have a gene id, so fetch its name and update the placeholder string
      lastValueFrom(
        this.geneQuery.fetch({ geneId: gid }, { fetchPolicy: 'cache-first' })
      ).then(({ data }) => {
        if (!data?.gene?.name) {
          console.error(
            `variant-input field could not fetch gene name for Gene:${gid}.`
          )
        } else {
          if (this.props.requireGenePlaceholder) {
            const ph = this.props.requireGenePlaceholder.replace(
              'GENE_NAME',
              data.gene.name
            )
            this.placeholder$.next(ph)
          } else {
            this.placeholder$.next(this.props.placeholder)
          }
        }
      })
    }
  }

  setTag(vid?: number) {
    if (!vid) return
    lastValueFrom(
      this.tagQuery.fetch({ variantId: vid }, { fetchPolicy: 'cache-first' })
    ).then(({ data }) => {
      if (!data?.variant?.id) {
        console.error(`${this.field.id} field could not fetch Variant:${vid}.`)
      } else {
        this.tagCacheId$.next(`Variant:${vid}`)
      }
    })
    // const cacheId = `Variant:${vid}`
    // // linkable variant from cache
    // const fragment = {
    //   id: cacheId,
    //   fragment: GET_CACHED_VARIANT,
    // }
    // const cachedVariant = this.apollo.client.readFragment(
    //   fragment
    // ) as LinkableVariant
    // if (cachedVariant) {
    //   this.tagCacheId$.next(cacheId)
    // } else {
    //   console.log(
    //     `variant-input field could not find cached Variant:${vid}, fetching.`
    //   )
    //   this.tagQuery.fetch({ variantId: vid }).subscribe(({ data }) => {
    //     const fetchedVariant = data.variant
    //     if (fetchedVariant) {
    //       this.tagCacheId$.next(cacheId)
    //     } else {
    //       console.error(
    //         `variant-input field could not find cached Variant:${vid}, or fetch it from the server.`
    //       )
    //     }
    //   })
    // }
  } // setTag

  unsetModel() {
    this.formControl.setValue(undefined)
  }

  deleteTag() {
    this.tagCacheId$.next(undefined)
  }

  resetField() {
    this.unsetModel()
    this.deleteTag()
  }

  optionTrackBy: TrackByFunction<VariantSelect2FieldsFragment> = (
    _index: number,
    option: VariantSelect2FieldsFragment
  ): number => {
    return option.id
  }
}
