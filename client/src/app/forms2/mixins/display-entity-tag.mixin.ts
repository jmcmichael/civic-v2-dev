import { Injectable, TrackByFunction } from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { Query, QueryRef } from 'apollo-angular'
import { EmptyObject } from 'apollo-angular/types'
import {
  asyncScheduler,
  defer,
  filter,
  from,
  iif,
  lastValueFrom,
  Observable,
  map,
  Subject,
  switchMap,
  throttleTime,
  distinctUntilChanged,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export type GetTypeaheadVarsFn<TAV extends EmptyObject> = (str: string) => TAV
export type GetTagQueryVarsFn<TV extends EmptyObject> = (id: number) => TV
export type GetTagCacheIdFromResponseFn<TT> = (response: TT) => string
export type GetTypeaheadQueryResultsFn<TAT, TAF> = (
  response: ApolloQueryResult<TAT>
) => TAF[]

export function DisplayEntityTag<
  // typeahead response data, vars, fragment
  TAT extends {},
  TAV extends EmptyObject,
  TAF extends EmptyObject,
  // tag response data, vars, fragment (entity)
  TT extends {},
  TV extends EmptyObject,
  TF extends EmptyObject
>() {
  return function DisplayEntityTagConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class DisplayEntityTagMixin extends Base {
      // BASE FIELD TYPE SOURCE STREAMS
      onValueChange$?: Subject<Maybe<number>>

      // LOCAL SOURCE STREAMS
      onFocus$!: Subject<boolean>
      onSearch$!: Subject<string> // emits on typeahead keypress
      onTagClose$!: Subject<MouseEvent> // emits on entity tag closed btn click

      // INTERMEDIATE STREAMS
      response$!: Observable<ApolloQueryResult<TAT>> // gql query responses

      // PRESENTATION STREAMS
      result$!: Observable<TAF[]> // typeahead query results
      isLoading$!: Observable<boolean> // typeahead query loading bool
      tagCacheId$!: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

      // QUERIES
      private typeaheadQuery!: Query<TAT, TAV>
      private tagQuery!: Query<TT, TV>

      // GETTERS
      getTypeaheadVarsFn!: GetTypeaheadVarsFn<TAV>
      getTypeahedQueryResultsFn!: GetTypeaheadQueryResultsFn<TAT, TAF>
      getTagQueryVarsFn!: GetTagQueryVarsFn<TV>
      getTagCacheIdFromResponseFn!: GetTagCacheIdFromResponseFn<TT>

      queryRef!: QueryRef<TAT, TAV>
      tagEntity!: TF

      configureDisplayEntityTag(
        taq: Query<TAT, TAV>,
        tq: Query<TT, TV>,
        getTypeaheadVarsFn: GetTypeaheadVarsFn<TAV>,
        getTypeaheadQueryResultsFn: GetTypeaheadQueryResultsFn<TAT, TAF>
      ): void {
        this.typeaheadQuery = taq
        this.tagQuery = tq
        this.getTypeaheadVarsFn = getTypeaheadVarsFn
        this.getTypeahedQueryResultsFn = getTypeaheadQueryResultsFn

        this.onSearch$ = new Subject<string>()
        this.onFocus$ = new Subject<boolean>()
        this.onTagClose$ = new Subject<MouseEvent>()
        this.onValueChange$ = new Subject<Maybe<number>>()
        this.tagCacheId$ = new Subject<Maybe<string>>()

        // check if base field tag properly configured
        if (!this.onValueChange$) {
          console.error(
            `${this.field.id} cannot find onValueChange$ Subject, ensure configureBaseField() has been called before configureDisplayEntityTag in its AfterViewInit hook.`
          )
          return
        }

        // on all value changes, deleteTag() if id undefined,
        // setTag() if defined
        this.onValueChange$.subscribe((id) => {
          if (!id) {
            this.deleteTag()
          } else {
            this.setTag(id)
          }
        })

        // execute a search on typeahead focus so users immediately see a list of options
        this.onFocus$
          .pipe(tag(`${this.field.id} onFocus$`), untilDestroyed(this))
          .subscribe((_) => {
            this.onSearch$.next('')
          })

        // set up typeahead watch & fetch calls
        this.response$ = this.onSearch$.pipe(
          // wait 1/3sec after typing activity stops to query server,
          // quash leading event, emit trailing event so we only get 1 search string
          throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
          switchMap((str: string) => {
            const query = this.getTypeaheadVarsFn(str)

            // helper functions for iif operator:
            const watchQuery = (query: TAV) => {
              // returns observable from initial watch() query
              this.queryRef = this.typeaheadQuery.watch(query)
              return this.queryRef.valueChanges
            }
            const fetchQuery = (query: TAV) => {
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
          filter((r) => !!r.data),
          map((r) => this.getTypeahedQueryResultsFn(r)),
          filter(isNonNulled)
        )

        // BUG: isLoading returns true a couple of times then false thereafter
        // for no good reason that I can determine
        this.isLoading$ = this.response$.pipe(
          pluck('loading'),
          tag(`${this.field.id} isLoading$`),
          distinctUntilChanged()
        )
      } // end configureDisplayEntityTag()

      setTag(id: number) {
        // emit last value from fetch (could emit loading events if server is queried)
        lastValueFrom(
          this.tagQuery.fetch(this.getTagQueryVarsFn(id), {
            fetchPolicy: 'cache-first',
          })
        ).then(({ data }) => {
          if (!data) {
            console.error(`${this.field.id} field could not fetch Gene:${id}.`)
          } else {
            this.tagCacheId$.next(this.getTagCacheIdFromResponseFn(data))
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

      optionTrackBy: TrackByFunction<TAF> = (
        _index: number,
        option: TAF
      ): number => {
        return option.id
      }
    }

    return DisplayEntityTagMixin
  }
}
