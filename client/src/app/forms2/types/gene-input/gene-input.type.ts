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
  GeneInputTypeaheadFieldsFragment,
  GeneInputTypeaheadGQL,
  GeneInputTypeaheadQuery,
  GeneInputTypeaheadQueryVariables,
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
  skip,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'

interface CvcGeneInputFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcGeneInputFieldConfig
  extends FormlyFieldConfig<CvcGeneInputFieldProps> {
  type: 'gene-input' | Type<CvcGeneInputField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField
  extends FieldType<FieldTypeConfig<CvcGeneInputFieldProps>>
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<number>> // emits all field model changes
  onValueChange$: Subject<Maybe<number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)
  onFocus$: Subject<boolean>
  onSearch$: Subject<string> // emits on typeahead keypress
  onTagClose$: Subject<MouseEvent> // emits on entity tag closed btn click

  // INTERMEDIATE STREAMS
  response$!: Observable<ApolloQueryResult<GeneInputTypeaheadQuery>> // gql query responses

  // PRESENTATION STREAMS
  result$!: Observable<GeneInputTypeaheadFieldsFragment[]> // gql query results
  isLoading$!: Observable<boolean> // gqp query loading bool
  tagCacheId$: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

  // STATE STREAMS
  geneId$?: Subject<Maybe<number>> // emit values from state's Subject

  queryRef!: QueryRef<GeneInputTypeaheadQuery, GeneInputTypeaheadQueryVariables> // gql query reference
  state: Maybe<EvidenceState>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcGeneInputFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search CIViC Genes',
    },
  }
  constructor(
    private typeaheadGQL: GeneInputTypeaheadGQL,
    private tagQuery: LinkableGeneGQL // gql query for fetching linkable tag if not cached
  ) {
    super()
    this.onSearch$ = new Subject<string>()
    this.onFocus$ = new Subject<boolean>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.onValueChange$ = new Subject<Maybe<number>>()
    this.tagCacheId$ = new Subject<Maybe<string>>()
  }

  // formly's field is assigned OnInit, so field setup must occur in AfterViewInit
  ngAfterViewInit(): void {
    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.key} field could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter((c) => c.field.key === this.field.key), // filter out other fields
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
        return
      }
      this.setTag(gid)
    })

    // if form has a state object,
    // get field's Subject from state & emit local value updates from it
    if (this.field?.options?.formState) {
      this.state = this.field.options.formState
      if (this.state && this.state.fields.geneId$) {
        this.geneId$ = this.state.fields.geneId$
        this.onValueChange$
          .pipe(
            // tag('gene-input state.fields.geneId$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.geneId$) this.geneId$.next(v)
          })
      }
    }

    // if field has been assigned a value before its initialization
    // via query-param extension or model initialization, emit onValueChange$, geneId$ events
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
      // skip(1), // drop empty string from initial field focus
      // wait 1/3sec after typing activity stops to query server
      // quash leading event, emit trailing event so we only get 1 search string
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      switchMap((str: string) => {
        const query: GeneInputTypeaheadQueryVariables = { entrezSymbol: str }
        // helper functions for iif operator:
        const watchQuery = (query: GeneInputTypeaheadQueryVariables) => {
          // returns observable from initial watch() query
          this.queryRef = this.typeaheadGQL.watch(query)
          return this.queryRef.valueChanges
        }
        const fetchQuery = (query: GeneInputTypeaheadQueryVariables) => {
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
      tag('gene-input response$')
    ) // end this.response$

    this.result$ = this.response$.pipe(
      pluck('data', 'geneTypeahead'),
      filter(isNonNulled),
      tag('gene-input result$')
    )

    // BUG: isLoading returns true a couple of times then false thereafter
    // for no good reason that I can determine
    this.isLoading$ = this.response$.pipe(
      pluck('loading'),
      // tag('gene-input isloading$'),
      distinctUntilChanged()
    )

    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.deleteTag()
    })
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
        console.error(`gene-input field could not fetch Gene:${gid}.`)
      } else {
        this.tagCacheId$.next(`Gene:${gid}`)
      }
    })
  }

  deleteTag() {
    this.tagCacheId$.next(undefined)
    this.formControl.setValue(undefined)
  }

  optionTrackBy: TrackByFunction<GeneInputTypeaheadFieldsFragment> = (
    _index: number,
    option: GeneInputTypeaheadFieldsFragment
  ): number => {
    return option.id
  }
}
