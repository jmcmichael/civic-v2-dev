import { InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { CvcCountEntitiesRequest, CvcCountEntity } from './entity-table.types'

/** what a resolver hands back: the first page of entities, plus the total */
export interface CvcCountEntitiesResult {
  total: number
  items: CvcCountEntity[]
}

/**
 * Resolves a count-tag popover's request onto real data. The framework
 * declares only this interface and token — which queries serve which
 * `entity`/scope pairs is the app's knowledge (see the layers table in
 * docs/01: the component must not know which entity or which server).
 * The app provides its implementation once, in the root providers; a table
 * rendered without a provider simply shows plain count tags.
 */
export interface CvcCountEntityResolver {
  resolve(request: CvcCountEntitiesRequest): Observable<CvcCountEntitiesResult>
}

export const CVC_COUNT_ENTITY_RESOLVER =
  new InjectionToken<CvcCountEntityResolver>('CVC_COUNT_ENTITY_RESOLVER')
