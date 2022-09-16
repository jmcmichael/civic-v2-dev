import { Injectable } from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { Maybe } from '@app/generated/civic.apollo'
import { FieldType } from '@ngx-formly/core'
import { Query } from 'apollo-angular'
import { EmptyObject } from 'apollo-angular/types'
import { lastValueFrom, Observable, Subject } from 'rxjs'
import { MixinConstructor } from 'ts-mixin-extended'

export type GetTagQueryVarsFn<V extends EmptyObject> = (id: number) => V
export type GetTypeaheadVarsFn<V extends EmptyObject> = (id: number) => V
export type GetTagCacheIdFromResponseFn<T> = (response: T) => string
export type GetTypeaheadEntitiesFromResponseFn<F, T> = (
  response: ApolloQueryResult<T>
) => F[]

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

      // getter fns for typeahead, tag query vars & query results
      getTypeaheadQueryVars!: GetTypeaheadVarsFn<TAV>
      getTypeaheadEntitiesFromResponse!: GetTypeaheadEntitiesFromResponseFn<
        TAF,
        TAT
      >
      getTagQueryVars!: GetTagQueryVarsFn<TV>
      getTagCacheIdFromResponse!: GetTagCacheIdFromResponseFn<TT>

      tagEntity!: TF

      configureDisplayEntityTag(taq: Query<TAT, TAV>, tq: Query<TT, TV>): void {
        this.typeaheadQuery = taq
        this.tagQuery = tq

        this.onSearch$ = new Subject<string>()
        this.onFocus$ = new Subject<boolean>()
        this.onTagClose$ = new Subject<MouseEvent>()
        this.onValueChange$ = new Subject<Maybe<number>>()
        this.tagCacheId$ = new Subject<Maybe<string>>()

        // on all value changes, deleteTag() if id undefined,
        if (!this.onValueChange$) {
          console.error(
            `${this.field.id} cannot find onValueChange$ Subject, ensure configureBaseField() has been called before configureDisplayEntityTag in its AfterViewInit hook.`
          )
          return
        }

        // setTag() if defined
        this.onValueChange$.subscribe((id) => {
          if (!id) {
            this.deleteTag()
          } else {
            this.setTag(id)
          }
        })
      }

      setTag(id: number) {
        // emit last value from fetch (could emit loading events if server is queried)
        lastValueFrom(
          this.tagQuery.fetch(this.getTagQueryVars(id), {
            fetchPolicy: 'cache-first',
          })
        ).then(({ data }) => {
          if (!data) {
            console.error(`${this.field.id} field could not fetch Gene:${id}.`)
          } else {
            this.tagCacheId$.next(this.getTagCacheIdFromResponse(data))
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
    }

    return DisplayEntityTagMixin
  }
}
