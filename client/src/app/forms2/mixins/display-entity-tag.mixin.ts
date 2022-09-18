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
  distinctUntilChanged,
  filter,
  from,
  iif,
  lastValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export type GetTypeaheadVarsFn<TAV extends EmptyObject, TAP> = (
  str: string,
  param?: TAP
) => TAV
export type GetTypeaheadResultsFn<TAT, TAF> = (
  response: ApolloQueryResult<TAT>
) => TAF[]
export type GetTypeaheadParamFn = () => Observable<Maybe<string | number>>
export type GetTagQueryVarsFn<TV extends EmptyObject> = (id: number) => TV
export type GetTagCacheIdFromResponseFn<TT> = (
  response: ApolloQueryResult<TT>
) => string

export function DisplayEntityTag<
  // typeahead response data, vars, fragment
  TAT extends {},
  TAV extends EmptyObject,
  TAF extends EmptyObject,
  // tag response data, vars, fragment (entity)
  TT extends {},
  TV extends EmptyObject,
  TF extends EmptyObject,
  // optional additional typeahead query param
  TAP = void
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
      typeaheadParam$?: Observable<Maybe<TAP>> // additional param for typeahead query

      // PRESENTATION STREAMS
      result$!: Observable<TAF[]> // typeahead query results
      isLoading$!: Observable<boolean> // typeahead query loading bool
      tagCacheId$!: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

      // QUERIES
      private typeaheadQuery!: Query<TAT, TAV>
      private tagQuery!: Query<TT, TV>

      // GETTERS
      getTypeaheadVars!: GetTypeaheadVarsFn<TAV, TAP>
      getTypeahedResults!: GetTypeaheadResultsFn<TAT, TAF>
      getTagQueryVars!: GetTagQueryVarsFn<TV>
      getTagCacheIdFromResponse!: GetTagCacheIdFromResponseFn<TT>

      queryRef!: QueryRef<TAT, TAV>
      tagEntity!: TF

      configureDisplayEntityTag(
        taq: Query<TAT, TAV>,
        tq: Query<TT, TV>,
        getTypeaheadVars: GetTypeaheadVarsFn<TAV, TAP>,
        getTypeaheadQueryResults: GetTypeaheadResultsFn<TAT, TAF>,
        getTagQueryVars: GetTagQueryVarsFn<TV>,
        getTagCacheIdFromResponse: GetTagCacheIdFromResponseFn<TT>,
        typeaheadParam$?: Observable<Maybe<TAP>>
      ): void {
        this.typeaheadQuery = taq
        this.tagQuery = tq
        this.getTypeaheadVars = getTypeaheadVars
        this.getTypeahedResults = getTypeaheadQueryResults
        this.getTagQueryVars = getTagQueryVars
        this.getTagCacheIdFromResponse = getTagCacheIdFromResponse
        this.typeaheadParam$ = typeaheadParam$

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

        // execute a search on typeahead focus to immediately display options
        this.onFocus$
          .pipe(untilDestroyed(this))
          .subscribe((_) => {
            this.onSearch$.next('')
          })

        // set up typeahead watch & fetch calls
        this.response$ = this.onSearch$.pipe(
          // wait 1/3sec after typing activity stops to query server,
          // quash leading event, emit trailing event so we only get 1 search string
          throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
          // get additional query vars, if any
          withLatestFrom(
            this.typeaheadParam$ !== undefined
              ? this.typeaheadParam$
              : of(undefined)
          ),
          switchMap(([str, param]: [string, Maybe<TAP>]) => {
            const query = this.getTypeaheadVars(str, param)

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
          map((r) => this.getTypeahedResults(r)),
          filter(isNonNulled)
        )

        this.isLoading$ = this.response$.pipe(
          pluck('loading'),
          distinctUntilChanged()
        )
      } // end configureDisplayEntityTag()

      setTag(id: number) {
        // query could emit loading events, so lastValueFrom used here to only emit query response data
        try {
          lastValueFrom(
            this.tagQuery.fetch(this.getTagQueryVars(id), {
              fetchPolicy: 'cache-first',
            })
          ).then((response) => {
            if (!response.data) {
              console.error(
                `${this.field.id} field could not fetch entity ${id} from cache or server.`
              )
            } else {
              this.tagCacheId$.next(this.getTagCacheIdFromResponse(response))
            }
          })
        } catch (err) {
          console.error(err)
        }
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
