import { Injectable, inject } from '@angular/core'
import {
  CvcCountEntitiesRequest,
  CvcCountEntitiesResult,
  CvcCountEntity,
  CvcCountEntityResolver,
} from '@app/tables'
import { TaggableTypename } from '@app/tags'
import { Observable, map, of } from 'rxjs'
import {
  CountedAssertionsGQL,
  CountedAssertionsQueryVariables,
  CountedEvidenceItemsGQL,
  CountedEvidenceItemsQueryVariables,
  CountedGroupVariantsGQL,
  CountedGroupVariantsQueryVariables,
  CountedMolecularProfilesGQL,
  CountedMolecularProfilesQueryVariables,
  CountedSourcesGQL,
  CountedSourcesQueryVariables,
  CountedVariantsGQL,
  CountedVariantsQueryVariables,
} from './counted-entities.query.gql.generated'

/** page size for the popovers; the cell footer names the remainder */
const FIRST = 10

/**
 * The app's `CVC_COUNT_ENTITY_RESOLVER`: routes a count-tag popover's
 * `{ entity, scope }` request onto the counted-entities queries, and maps
 * the first page into tag refs + cache seeds. Which queries exist for which
 * scope is app knowledge — the entity-table framework only declares the
 * token (see the layers table in tables/docs/01).
 *
 * `entity: 'Variant'` routes by scope: `variantGroupId` only exists on
 * `browseVariants`, everything else goes to `variants` (whose concrete
 * nodes seed as plain `Variant`, the variants-table precedent).
 */
@Injectable({ providedIn: 'root' })
export class CvcCountedEntitiesResolver implements CvcCountEntityResolver {
  private readonly evidence = inject(CountedEvidenceItemsGQL)
  private readonly assertions = inject(CountedAssertionsGQL)
  private readonly molecularProfiles = inject(CountedMolecularProfilesGQL)
  private readonly variants = inject(CountedVariantsGQL)
  private readonly groupVariants = inject(CountedGroupVariantsGQL)
  private readonly sources = inject(CountedSourcesGQL)

  resolve(
    request: CvcCountEntitiesRequest
  ): Observable<CvcCountEntitiesResult> {
    const scope = request.scope
    switch (request.entity) {
      case 'EvidenceItem':
        return this.evidence
          .fetch({
            variables: {
              ...scope,
              first: FIRST,
            } as CountedEvidenceItemsQueryVariables,
          })
          .pipe(map((r) => this.result(r.data?.evidenceItems, 'EvidenceItem')))
      case 'Assertion':
        return this.assertions
          .fetch({
            variables: {
              ...scope,
              first: FIRST,
            } as CountedAssertionsQueryVariables,
          })
          .pipe(map((r) => this.result(r.data?.assertions, 'Assertion')))
      case 'MolecularProfile':
        return this.molecularProfiles
          .fetch({
            variables: {
              ...scope,
              first: FIRST,
            } as CountedMolecularProfilesQueryVariables,
          })
          .pipe(
            map((r) =>
              this.result(r.data?.molecularProfiles, 'MolecularProfile')
            )
          )
      case 'Variant':
        return scope['variantGroupId']
          ? this.groupVariants
              .fetch({
                variables: {
                  ...scope,
                  first: FIRST,
                } as CountedGroupVariantsQueryVariables,
              })
              .pipe(map((r) => this.result(r.data?.browseVariants, 'Variant')))
          : this.variants
              .fetch({
                variables: {
                  ...scope,
                  first: FIRST,
                } as CountedVariantsQueryVariables,
              })
              .pipe(map((r) => this.result(r.data?.variants, 'Variant')))
      case 'Source':
        return this.sources
          .fetch({
            variables: {
              ...scope,
              first: FIRST,
            } as CountedSourcesQueryVariables,
          })
          .pipe(map((r) => this.result(r.data?.browseSources, 'Source')))
      default:
        return of({ total: 0, items: [] })
    }
  }

  private result(
    connection:
      | {
          totalCount: number
          edges: Array<{ node?: Record<string, unknown> | null } | null>
        }
      | null
      | undefined,
    typename: TaggableTypename
  ): CvcCountEntitiesResult {
    const nodes = (connection?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is Record<string, unknown> => !!node)
    const items: CvcCountEntity[] = nodes.map((node) => {
      const id = node['id'] as number
      return {
        ref: { __typename: typename, id },
        seed: <CvcCountEntity['seed']>{
          ...node,
          __typename: typename,
          id,
          // BrowseSource.name is nullable; citation is the display fallback
          // (the sources table's own seed rule)
          ...(typename === 'Source' && !node['name']
            ? { name: node['citation'] }
            : {}),
        },
      }
    })
    return { total: connection?.totalCount ?? items.length, items }
  }
}
