import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  TrackByFunction,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { HasValueChanges } from '@app/forms2/mixins/has-value-changes.mixin'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  GeneSelectTypeaheadFieldsFragment,
  GeneSelectTypeaheadGQL,
  GeneSelectTypeaheadQuery,
  GeneSelectTypeaheadQueryVariables,
  LinkableGeneGQL,
  Maybe,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { QueryRef } from 'apollo-angular'
import {
  asyncScheduler,
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
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  isRepeatItem: boolean
}

export interface CvcGeneSelectFieldConfig
  extends FormlyFieldConfig<CvcGeneSelectFieldProps> {
  type: 'gene-select' | 'gene-select-item' | Type<CvcGeneSelectField>
}

const GeneSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcGeneSelectFieldProps>>(),
  HasValueChanges
)

@UntilDestroy()
@Component({
  selector: 'cvc-gene-select',
  templateUrl: './gene-select.type.html',
  styleUrls: ['./gene-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneSelectField
  extends GeneSelectMixin
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<number>> // emits all field model changes
  onValueChange$: Subject<Maybe<number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)
  onFocus$: Subject<boolean>
  onSearch$: Subject<string> // emits on typeahead keypress
  onTagClose$: Subject<MouseEvent> // emits on entity tag closed btn click

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<GeneSelectTypeaheadQuery>> // gql query responses

  // PRESENTATION STREAMS
  result$!: Observable<GeneSelectTypeaheadFieldsFragment[]> // gql query results
  isLoading$!: Observable<boolean> // gqp query loading bool
  tagCacheId$: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

  // STATE STREAMS
  geneId$?: Subject<Maybe<number>> // emit values from state's Subject

  queryRef!: QueryRef<
    GeneSelectTypeaheadQuery,
    GeneSelectTypeaheadQueryVariables
  > // gql query reference
  state: Maybe<EvidenceState>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcGeneSelectFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search Genes',
      isRepeatItem: false,
    },
  }

  repeatFieldId?: string

  constructor(
    public injector: Injector,
    private typeaheadGQL: GeneSelectTypeaheadGQL,
    private tagQuery: LinkableGeneGQL // gql query for fetching linkable tag if not cached
  ) {
    super(injector)
    this.onSearch$ = new Subject<string>()
    this.onFocus$ = new Subject<boolean>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.onValueChange$ = new Subject<Maybe<number>>()
    this.tagCacheId$ = new Subject<Maybe<string>>()
  }

  // formly's field is assigned OnInit, so field setup must occur in AfterViewInit
  ngAfterViewInit(): void {
    this.configureValueChanges()
    // if this is a repeat-field item, store parent repeat-field key
    // to use in field changes filter
    if (this.props.isRepeatItem) {
      if (!this.field.parent?.id) {
        console.error(
          `base-input field is configured as a repeat-field item, but could not locate a parent id.`
        )
      } else {
        this.repeatFieldId = this.field.parent.id
      }
    }

    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.key} field could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        // tag(`gene-select ${this.field.id} onModelChange$`),
        filter((c) => c.field.id === this.field.id), // filter out other fields
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        this.onValueChange$.next(v)
      })
    }

    // on all value changes, deleteTag() if gid undefined,
    // setTag() if defined
    this.onValueChange$.subscribe((gid: Maybe<number>) => {
      if (!gid) {
        this.deleteTag()
      } else {
        this.setTag(gid)
      }
    })

    // do not attach repeat-field items to state
    if (!this.props.isRepeatItem) {
      // if form has a state object,
      // get field's Subject from state & emit local value updates from it
      if (this.field?.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.geneId$) {
          this.geneId$ = this.state.fields.geneId$
          this.onValueChange$.pipe(untilDestroyed(this)).subscribe((v) => {
            if (this.geneId$) this.geneId$.next(v)
          })
        }
      }
    }

    // if field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state,
    // model initialization), emit onValueChange$, geneId$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
      if (this.geneId$) this.geneId$.next(v)
    }

    this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.onSearch$.next('')
    })

    // set up typeahead watch & fetch calls
    this.response$ = this.onSearch$.pipe(
      // wait 1/3sec after typing activity stops to query server,
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      switchMap((str: string) => {
        const query: GeneSelectTypeaheadQueryVariables = { entrezSymbol: str }
        // helper functions for iif operator:
        const watchQuery = (query: GeneSelectTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.typeaheadGQL.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: GeneSelectTypeaheadQueryVariables) => {
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

    this.result$ = this.response$.pipe(
      pluck('data', 'geneTypeahead'),
      filter(isNonNulled)
    )

    // BUG: isLoading returns true a couple of times then false thereafter
    // for no good reason that I can determine
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      // tag('gene-input isloading$'),
      distinctUntilChanged()
    )

    // if this is a repeat-item field, emit onRemove$ event on tag close,
    // otherwise, just reset field locally
    if (this.props.isRepeatItem) {
      // check if parent field is of 'repeat-field' type
      if (!(this.field.parent && this.field.parent?.type === 'repeat-field')) {
        console.error(
          `${this.field.id} does not appear to have a parent type of 'repeat-field'.`
        )
      } else {
        // check if parent repeat-field attached the onRemove$ Subject
        if (!this.field.parent?.props?.onRemove$) {
          console.error(
            `${this.field.id} cannot find reference to parent repeat-field onRemove$.`
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
  } // ngAfterViewInit()

  // verifies that a cached record exists for the given geneId,
  // and fetches from the server if not, then sends tagCacheId$ event
  // NOTE: probably can use one of apollo's query modes to do the fetch-cache,
  // fetch server if needed but not 100% sure that does what I think
  setTag(gid?: number) {
    if (!gid) return
    lastValueFrom(
      this.tagQuery.fetch({ geneId: gid }, { fetchPolicy: 'cache-first' })
    ).then(({ data }) => {
      if (!data?.gene?.id) {
        console.error(`${this.field.id} field could not fetch Gene:${gid}.`)
      } else {
        this.tagCacheId$.next(`Gene:${gid}`)
      }
    })
  }

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

  optionTrackBy: TrackByFunction<GeneSelectTypeaheadFieldsFragment> = (
    _index: number,
    option: GeneSelectTypeaheadFieldsFragment
  ): number => {
    return option.id
  }
}
