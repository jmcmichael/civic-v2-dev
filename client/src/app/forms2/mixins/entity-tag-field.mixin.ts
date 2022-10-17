import {
  ChangeDetectorRef,
  Injectable,
  QueryList,
  TemplateRef,
  TrackByFunction,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { InputMaybe, Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { Query, QueryRef } from 'apollo-angular'
import { EmptyObject } from 'apollo-angular/types'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
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
import { combineLatestArray, isNonNulled } from 'rxjs-etc'
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
export type GetTagQueryResultsFn<TT, TAF> = (
  response: ApolloQueryResult<TT>
) => Maybe<TAF>
export type GetSelectOptionsFromResultsFn<TAF> = (
  results: TAF[],
  tplRefs: QueryList<TemplateRef<any>>,
  mode: 'label' | 'template'
) => NzSelectOptionInterface[]

export interface EntityTagFieldOptions<TAT, TAV, TAP, TAF, TT, TV> {
  typeaheadQuery: Query<TAT, TAV>
  typeaheadParam$?: Observable<any>
  tagQuery: Query<TT, TV>
  getTypeaheadVarsFn: GetTypeaheadVarsFn<TAV, TAP>
  getTypeaheadResultsFn: GetTypeaheadResultsFn<TAT, TAF>
  getTagQueryVarsFn: GetTagQueryVarsFn<TV>
  getTagQueryResultsFn: GetTagQueryResultsFn<TT, TAF>
  getSelectOptionsFromResultsFn: GetSelectOptionsFromResultsFn<TAF>
  changeDetectorRef: ChangeDetectorRef
}

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
      onCreate$!: Subject<TAF> // emits entity on create

      // INTERMEDIATE STREAMS
      response$!: Observable<ApolloQueryResult<TAT>> // gql query responses

      // PRESENTATION STREAMS
      result$!: Observable<TAF[]> // typeahead query results
      isLoading$!: Subject<boolean> // typeahead query loading bool
      selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>
      tagCacheId$!: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

      // CONFIG OPTIONS

      // config option queries
      private typeaheadQuery!: Query<TAT, TAV>
      private tagQuery!: Query<TT, TV>
      typeaheadParam$?: Observable<any> // additional param for typeahead query

      // config options getter fns
      getTypeaheadVars!: GetTypeaheadVarsFn<TAV, TAP>
      getTypeahedResults!: GetTypeaheadResultsFn<TAT, TAF>
      getTagQueryVars!: GetTagQueryVarsFn<TV>
      getTagQueryResults!: GetTagQueryResultsFn<TT, TAF>
      getSelectOptionsFromResults!: GetSelectOptionsFromResultsFn<TAF>
      cdr!: ChangeDetectorRef

      // LOCAL REFS
      queryRef!: QueryRef<TAT, TAV>
      optionTemplates?: QueryList<TemplateRef<any>>

      configureEntityTagField(
        options: EntityTagFieldOptions<TAT, TAV, TAP, TAF, TT, TV>
      ): void {
        this.typeaheadQuery = options.typeaheadQuery
        this.tagQuery = options.tagQuery
        this.getTypeaheadVars = options.getTypeaheadVarsFn
        this.getTypeahedResults = options.getTypeaheadResultsFn
        this.getTagQueryVars = options.getTagQueryVarsFn
        this.getTagQueryResults = options.getTagQueryResultsFn
        this.getSelectOptionsFromResults =
          options.getSelectOptionsFromResultsFn
        this.typeaheadParam$ = options.typeaheadParam$
        this.cdr = options.changeDetectorRef

        this.onSearch$ = new Subject<string>()
        this.onFocus$ = new Subject<void>()
        this.isLoading$ = new Subject<boolean>()
        this.onTagClose$ = new Subject<MouseEvent>()
        this.onValueChange$ = new Subject<Maybe<number>>()
        this.onCreate$ = new Subject<TAF>()
        this.tagCacheId$ = new Subject<Maybe<string>>()

        // check if base field tag properly configured
        if (!this.onValueChange$) {
          console.error(
            `${this.field.id} cannot find onValueChange$ Subject, ensure configureBaseField() has been called before configureDisplayEntityTag in its AfterViewInit hook.`
          )
          return
        }

        // execute a search on typeahead focus to immediately display options
        this.onFocus$
          .pipe(withLatestFrom(this.onSearch$), untilDestroyed(this))
          .subscribe(([_, searchStr]) => {
            this.onSearch$.next(searchStr)
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
          // tag(`${this.field.id} onSearch$`),
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
                  untilDestroyed(this)
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
          map((r) => this.getTypeahedResults(r))
          // tag(`${this.field.id} entity-tag-field.mixin result$`)
        )

        if (!this.optionTemplates) {
          console.warn(
            `${this.field.id} could not find reference to optionTemplates ViewChildren, options will only show entity name text.`
          )
          this.result$.pipe(untilDestroyed(this)).subscribe((r: TAF[]) => {
            this.selectOption$.next(
              r.map((drug) => {
                return {
                  label: drug.name,
                  value: drug.id,
                }
              })
            )
          })
        } else {
          // subscribe to optionTemplates ViewChildren changes,
          // which are re-rendered whenever result$ emits. Combine
          // option templates with results, and for each result,
          // attach its template to a NzSelectOptionInterface object's label,
          // and set the value to the entity id.
          this.optionTemplates.changes
            .pipe(
              tag(`${this.field.id} optionTemplates.changes`),
              withLatestFrom(this.result$),
              untilDestroyed(this)
            )
            .subscribe(
              ([tplRefs, results]: [QueryList<TemplateRef<any>>, TAF[]]) => {
                const options = this.getSelectOptionsFromResults(
                  results,
                  tplRefs,
                  'template'
                )
                this.selectOption$.next(options)
                this.cdr.detectChanges()
              }
            )
        }

        this.onCreate$.pipe(untilDestroyed(this)).subscribe((entity: TAF) => {
          this.selectOption$.next([{ label: entity.name, value: entity.id }])
        })

        this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
          this.resetField()
        })

        // if a prepopulated form value exists, set by the observe-query-param extension,
        // use tagQuery to create select option(s) for it so that nz-select's tags render
        if (this.formControl.value) {
          const v = this.formControl.value
          if (Object.keys(v).length > 0 && v.constructor === Object) {
            console.error(
              `${this.field.id} prepopulated value must be a primitive or array of primitives, value is an object:`,
              v
            )
            return
          }
          let queries: Observable<TT>[]
          // wrap primitives in array
          if (typeof v === 'number') {
            queries = this.getFetchFn([v])
          } else {
            queries = this.getFetchFn(v)
          }
          combineLatestArray(queries)
            .pipe(
              // tag(`${this.field.id} combineLatestArray(queries)`),
              map((data) => {
                if (!(data.length > 0)) return []
                if (!data.every(({ drug }) => drug !== undefined)) return []
                return data.map(({ drug }) => {
                  const d = drug as TF
                  return {
                    label: d.name,
                    value: d.id,
                  }
                })
              })
            )
            .subscribe((options) => {
              if (!options || !options.every((o) => typeof o !== 'undefined')) {
                console.error(
                  `${this.field.id} prepopulate select options error: one or more option requests failed.`,
                  options
                )
              }
              this.selectOption$.next(options)
            })
        }
      } // end configureDisplayEntityTag()

      getFetchFn(ids: number[]): Observable<TT>[] {
        const queries = ids.map((id) =>
          this.tagQuery
            .fetch(this.getTagQueryVars(id), { fetchPolicy: 'cache-first' })
            .pipe(pluck('data'), filter(isNonNulled))
        )
        return queries
      }

      resetField() {
        this.formControl.setValue(undefined)
        this.tagCacheId$.next(undefined)
      }

      optionTrackBy: TrackByFunction<NzSelectOptionInterface> = (
        _index: number,
        option: NzSelectOptionInterface
      ): number => {
        return option.value
      }
    }

    return EntityTagFieldMixin
  }
}
