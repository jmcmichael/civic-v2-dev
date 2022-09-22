import { Injectable, TrackByFunction } from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { InputMaybe, Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { Query, QueryRef } from 'apollo-angular'
import { EmptyObject } from 'apollo-angular/types'
import {
  asyncScheduler,
  BehaviorSubject,
  defer,
  distinctUntilChanged,
  EMPTY,
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

export function EntityTagField<
  // typeahead response data, vars, fragment
  TAT extends EmptyObject,
  TAV extends EmptyObject,
  TAF extends EmptyObject,
  // tag response data, vars, fragment (entity)
  TT extends EmptyObject,
  TV extends EmptyObject,
  TF extends EmptyObject,
  // optional additional typeahead query param
  TAP = void
>() {
  return function EntityTagFieldConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class EntityTagFieldMixin extends Base {
      // BASE FIELD TYPE SOURCE STREAMS
      onValueChange$?: Subject<Maybe<number>>

      // LOCAL SOURCE STREAMS
      onFocus$!: Subject<void>
      onSearch$!: Subject<string> // emits on typeahead keypress
      onTagClose$!: Subject<MouseEvent> // emits on entity tag closed btn click

      // INTERMEDIATE STREAMS
      response$!: Observable<ApolloQueryResult<TAT>> // gql query responses
      typeaheadParam$?: Observable<any> // additional param for typeahead query

      // PRESENTATION STREAMS
      result$!: Observable<TAF[]> // typeahead query results
      isLoading$!: Subject<boolean> // typeahead query loading bool
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

      configureEntityTagField(
        taq: Query<TAT, TAV>,
        tq: Query<TT, TV>,
        getTypeaheadVars: GetTypeaheadVarsFn<TAV, TAP>,
        getTypeaheadQueryResults: GetTypeaheadResultsFn<TAT, TAF>,
        getTagQueryVars: GetTagQueryVarsFn<TV>,
        getTagCacheIdFromResponse: GetTagCacheIdFromResponseFn<TT>,
        typeaheadParam$?: Observable<any>
      ): void {
        this.typeaheadQuery = taq
        this.tagQuery = tq
        this.getTypeaheadVars = getTypeaheadVars
        this.getTypeahedResults = getTypeaheadQueryResults
        this.getTagQueryVars = getTagQueryVars
        this.getTagCacheIdFromResponse = getTagCacheIdFromResponse
        this.typeaheadParam$ = typeaheadParam$

        this.onSearch$ = new Subject<string>()
        this.onFocus$ = new Subject<void>()
        this.isLoading$ = new Subject<boolean>()
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

        // on all value changes, resetField() if id undefined,
        // setTag() if defined
        this.onValueChange$.subscribe((id) => {
          if (!id) {
            this.resetField()
          } else {
            this.setTag(id)
          }
        })

        // execute a search on typeahead focus to immediately display options
        this.onFocus$.pipe(untilDestroyed(this)).subscribe((_) => {
          // this.onSearch$.next('')
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
              // emit loading events from isLoading$
              this.queryRef.valueChanges
                .pipe(
                  pluck('loading'),
                  distinctUntilChanged(),
                  untilDestroyed(this),
                  tag(`${this.field.id} queryRef.valueChanges 'loading'`)
                )
                .subscribe((l) => this.isLoading$.next(l))

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
          filter((r) => !r.loading),
          map((r) => this.getTypeahedResults(r)),
        )

        // if this field is the child of a repeat-field type,
        // get reference to its onRemove$ and emit its ID when tag closed,
        // otherwise, handle model reset and tag deletion locally
        if (this.props.isRepeatItem) {
          // check if parent field is of 'repeat-field' type
          if (
            !(this.field.parent && this.field.parent?.type === 'repeat-field')
          ) {
            console.error(
              `${this.field.id} field does not appear to have a parent type of 'repeat-field'.`
            )
            return
          }
          // check if parent repeat-field attached the onRemove$ Subject
          if (!this.field.parent?.props?.onRemove$) {
            console.error(
              `${this.field.id} specified as a repeat-item field, but no reference to parent repeat-field onRemove$ found.`
            )
            return
          }
          const onRemove$: Subject<number> = this.field.parent.props.onRemove$
          this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
            this.resetField()
            onRemove$.next(Number(this.key))
          })
        } else {
          // field is not a repeat-item, so just reset the field on tag close
          this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
            this.resetField()
          })
        }
      } // end configureDisplayEntityTag()

      setTag(id: number) {
        // tagQuery.fetch() was failing silently, hence this try/catch statement
        try {
          // query could emit loading events, so lastValueFrom used here to only emit query response data
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

      resetField() {
        this.formControl.setValue(undefined)
        this.tagCacheId$.next(undefined)
      }

      optionTrackBy: TrackByFunction<TAF> = (
        _index: number,
        option: TAF
      ): number => {
        return option.id
      }
    }

    return EntityTagFieldMixin
  }
}
function startWith(
  arg0: boolean
): import('rxjs').OperatorFunction<boolean, boolean> {
  throw new Error('Function not implemented.')
}
