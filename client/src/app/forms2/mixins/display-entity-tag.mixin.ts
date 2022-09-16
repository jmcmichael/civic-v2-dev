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
export type GetTypeaheadEntitiesFromResponseFn<E, T> = (
  response: ApolloQueryResult<T>
) => E[]

export function DisplayEntityTag<
  // typeahead query, response, vars
  TAQ extends Query<TAT, TAV>,
  TAT extends {},
  TAV extends EmptyObject,
  // tag query, response, vars
  TQ extends Query<TT, TV>,
  TT extends {},
  TV extends EmptyObject,
  // the civic entity type
  E extends EmptyObject
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
      result$!: Observable<E[]> // gql query results
      isLoading$!: Observable<boolean> // gqp query loading bool
      tagCacheId$!: Subject<Maybe<string>> // emits cache IDs for rendering entity-tag

      // QUERIES
      typeaheadQuery!: TAQ
      tagQuery!: TQ

      // getter fns for typeahead, tag query vars & query results
      getTypeaheadQueryVars!: GetTypeaheadVarsFn<TAV>
      getTypeaheadEntitiesFromResponse!: GetTypeaheadEntitiesFromResponseFn<
        E,
        TAT
      >
      getTagQueryVars!: GetTagQueryVarsFn<TV>
      getTagCacheIdFromResponse!: GetTagCacheIdFromResponseFn<TT>

      configureDisplayEntityTag(taq: TAQ, tq: TQ): void {
        this.typeaheadQuery = taq
        this.tagQuery = tq

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
