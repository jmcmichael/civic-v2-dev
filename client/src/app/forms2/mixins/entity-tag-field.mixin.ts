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
export type GetTypeaheadResultsFn<TAQ, TAF> = (
  response: ApolloQueryResult<TAQ>
) => TAF[]
export type GetTagQueryVarsFn<TV extends EmptyObject> = (id: number) => TV
export type GetTagQueryResultsFn<TQ, TAF> = (
  response: ApolloQueryResult<TQ>
) => Maybe<TAF>
export type GetSelectedItemFn<TAF> = (item: TAF) => NzSelectOptionInterface
export type GetSelectOptionsFn<TAF> = (
  results: TAF[],
  tplRefs: QueryList<TemplateRef<any>>
) => NzSelectOptionInterface[]

export interface EntityTagFieldOptions<TAQ, TAV, TAP, TAF, TQ, TV> {
  typeaheadQuery: Query<TAQ, TAV>
  typeaheadParam$?: Observable<any>
  typeaheadParamName$?: BehaviorSubject<Maybe<any>>
  tagQuery: Query<TQ, TV>
  getTypeaheadVarsFn: GetTypeaheadVarsFn<TAV, TAP>
  getTypeaheadResultsFn: GetTypeaheadResultsFn<TAQ, TAF>
  getTagQueryVarsFn: GetTagQueryVarsFn<TV>
  getTagQueryResultsFn: GetTagQueryResultsFn<TQ, TAF>
  getSelectedItemOptionFn: GetSelectedItemFn<TAF>
  getSelectOptionsFn: GetSelectOptionsFn<TAF>
  changeDetectorRef: ChangeDetectorRef
}

/*
 * TAQ = typeahead query
 * TAV = typeahead query variables
 * TAP = typeahead query optional parameters fragment
 * TQ  = tag query
 * TV  = tag query variables
 * TAP = optional typeahead query paramters type
 * */

export function EntityTagField<
  // typeahead query data, vars, fragment
  TAQ extends EmptyObject,
  TAV extends EmptyObject,
  TAF extends EmptyObject,
  // tag response data, vars, fragment (entity)
  TQ extends EmptyObject,
  TV extends EmptyObject,
  // optional additional typeahead query param
  TAP = void
>() {
  return function EntityTagFieldConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class EntityTagFieldMixin extends Base {
      // BASE FIELD TYPE SOURCE STREAMS
      // need to declare them to reference them here, then base-field creates these
      onValueChange$?: Subject<Maybe<number>>

      // LOCAL SOURCE STREAMS
      onFocus$!: Subject<void>
      onSearch$!: Subject<string> // emits on typeahead keypress
      onTagClose$!: Subject<MouseEvent> // emits on entity tag closed btn click
      onCreate$!: Subject<TAF> // emits entity on create

      // INTERMEDIATE STREAMS
      response$!: Observable<ApolloQueryResult<TAQ>> // gql query responses

      // PRESENTATION STREAMS
      result$!: BehaviorSubject<TAF[]> // typeahead query results
      isLoading$!: Subject<boolean> // typeahead query loading bool
      selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>

      // CONFIG OPTIONS

      // config option queries
      private typeaheadQuery!: Query<TAQ, TAV>
      private tagQuery!: Query<TQ, TV>
      private typeaheadParam$?: Observable<any> // additional param for typeahead query
      private typeaheadParamName$?: BehaviorSubject<Maybe<string>> // additional param for typeahead query

      // config options getter fns
      getTypeaheadVars!: GetTypeaheadVarsFn<TAV, TAP>
      getTypeahedResults!: GetTypeaheadResultsFn<TAQ, TAF>
      getTagQueryVars!: GetTagQueryVarsFn<TV>
      getTagQueryResults!: GetTagQueryResultsFn<TQ, TAF>
      getSelectedItemOption!: GetSelectedItemFn<TAF>
      getSelectOptions!: GetSelectOptionsFn<TAF>
      cdr!: ChangeDetectorRef

      // LOCAL REFS
      queryRef!: QueryRef<TAQ, TAV>
      optionTemplates?: QueryList<TemplateRef<any>>

      configureEntityTagField(
        options: EntityTagFieldOptions<TAQ, TAV, TAP, TAF, TQ, TV>
      ): void {
        this.typeaheadQuery = options.typeaheadQuery
        this.tagQuery = options.tagQuery
        this.getTypeaheadVars = options.getTypeaheadVarsFn
        this.getTypeahedResults = options.getTypeaheadResultsFn
        this.getTagQueryVars = options.getTagQueryVarsFn
        this.getTagQueryResults = options.getTagQueryResultsFn
        this.getSelectedItemOption = options.getSelectedItemOptionFn
        this.getSelectOptions = options.getSelectOptionsFn
        this.typeaheadParam$ = options.typeaheadParam$
        this.typeaheadParamName$ = options.typeaheadParamName$
        this.cdr = options.changeDetectorRef

        this.onSearch$ = new Subject<string>()
        this.onFocus$ = new Subject<void>()
        this.isLoading$ = new Subject<boolean>()
        this.result$ = new BehaviorSubject<TAF[]>([])
        this.onTagClose$ = new Subject<MouseEvent>()
        this.onCreate$ = new Subject<TAF>()
        this.selectOption$ = new BehaviorSubject<NzSelectOptionInterface[]>([])

        // this.selectOption$.pipe(tag(`${this.field.id} selectOption$`)).subscribe()
        // this.onSearch$.pipe(tag(`${this.field.id} onSearch$`)).subscribe()
        // this.result$.pipe(tag(`${this.field.id} result$`)).subscribe()
        this.onFocus$.pipe(tag(`${this.field.id} onFocus$`)).subscribe()

        // check if base field tag properly configured
        if (!this.onValueChange$) {
          console.error(
            `${this.field.id} cannot find onValueChange$ Subject, ensure field calls configureBaseField() before configureDisplayEntityTag() in its AfterViewInit hook.`
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
          // return optional typeaheadParam observable, or undefined observable
          withLatestFrom(
            this.typeaheadParam$ !== undefined
              ? this.typeaheadParam$
              : of(undefined)
          ),
          // tag(`${this.field.id} entity-tag-field onSearch$`),
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

        this.response$
          .pipe(
            filter((r) => !r.loading),
            map((r) => this.getTypeahedResults(r)),
            // tag(`${this.field.id} entity-tag-field.mixin result$`),
            untilDestroyed(this)
          )
          .subscribe((results: TAF[]) => {
            this.result$.next(results)
          })

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
          // which are re-rendered whenever result$ emits. For each
          // template, getSelectOptions() generates a NzSelectOption that
          // attaches the pre-generated row template to a result value.
          this.optionTemplates.changes
            .pipe(
              // tag(`${this.field.id} optionTemplates.changes`),
              withLatestFrom(this.result$),
              untilDestroyed(this)
            )
            .subscribe(
              ([tplRefs, results]: [QueryList<TemplateRef<any>>, TAF[]]) => {
                const options = this.getSelectOptions(results, tplRefs)
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
          let queries: Observable<ApolloQueryResult<TQ>>[]
          // wrap primitives in array
          if (typeof v === 'number') {
            queries = this.getFetchFn([v])
          } else {
            queries = this.getFetchFn(v)
          }
          combineLatestArray(queries)
            .pipe(
              // tag(`${this.field.id} combineLatestArray(queries)`),
              map((queries) => {
                if (!(queries.length > 0)) return []
                if (
                  !queries.every(
                    (r: ApolloQueryResult<TQ>) =>
                      this.getTagQueryResults(r) !== undefined
                  )
                ) {
                  console.error(
                    `${this.field.id} pre-populate failed, one or more entity tag queries did not succeed.`
                  )
                  return []
                }
                return queries.map(
                  (result: ApolloQueryResult<TQ>): NzSelectOptionInterface => {
                    const item = this.getTagQueryResults(result)
                    return this.getSelectedItemOption(item!)
                  }
                )
              })
            )
            .subscribe((options) => {
              if (!options || !options.every((o) => typeof o !== 'undefined')) {
                console.error(
                  `${this.field.id} prepopulate select options error: one or more requests failed.`,
                  options
                )
              }
              this.selectOption$.next(options)
            })
        }
      } // end configureDisplayEntityTag()

      getFetchFn(ids: number[]): Observable<ApolloQueryResult<TQ>>[] {
        const queries = ids.map((id) =>
          this.tagQuery
            .fetch(this.getTagQueryVars(id), { fetchPolicy: 'cache-first' })
            .pipe(filter((r) => !!r.data))
        )
        return queries
      }

      resetField() {
        if (this.props.isMultiSelect) {
          this.formControl.setValue([])
        } else {
          this.formControl.setValue(undefined)
        }
        // reset options to prevent brief flash of previous
        // search (or prepopulate) option items during subsequent searches
        if (this.selectOption$) this.selectOption$.next([])
        // reset results to empty out optionTemplate QueryList, forcing
        // re-render of optionTemplates for subsequent search results, even
        // if cached results are returned
        if (this.result$) this.result$.next([])
      }

    }

    return EntityTagFieldMixin
  }
}
