import { Maybe } from '@app/generated/civic.apollo.types'
import { Apollo } from 'apollo-angular'
import { isTaggableTypename, tagSpecFor } from './entity-tag-specs'
import { LinkableEntity } from './entity-tag.types'

/**
 * Reads an already-cached entity by typename and id, using the same
 * Linkable* fragment CvcTag renders from.
 *
 * The evidence and variant managers filter their entity columns by NAME
 * rather than id, so they resolve the ids a form hands them into names. Both
 * did it by interpolating a fragment document at runtime —
 * `fragment Linkable${typename}Entity on ${typename} { id name link }` —
 * which codegen cannot see, and which hand-repeated a field list that could
 * silently drift from the real fragment. This reads the registered one.
 *
 * Returns undefined when the entity is not in the cache; callers decide
 * whether that is worth reporting.
 */
export function readCachedEntity(
  apollo: Apollo,
  typename: string,
  id: number
): Maybe<LinkableEntity> {
  if (!isTaggableTypename(typename)) return undefined
  return (
    apollo.client.readFragment<LinkableEntity>({
      id: `${typename}:${id}`,
      fragment: tagSpecFor(typename).fragment,
    }) ?? undefined
  )
}

/** The cached entity's display name, or undefined if it is not cached. */
export function readCachedEntityName(
  apollo: Apollo,
  typename: string,
  id: number
): Maybe<string> {
  return readCachedEntity(apollo, typename, id)?.name
}

/**
 * Writes an entity under the same Linkable* fragment CvcTag renders from, so a
 * tag holding only `{ __typename, id }` can resolve it.
 *
 * This exists for the denormalised `Browse*` types. `browseVariants` returns
 * `BrowseVariant`, which normalises to `BrowseVariant:<id>` and carries the
 * variant's and its feature's fields flattened into one object — so nothing
 * ever writes `Variant:<id>` or `Feature:<id>`, and the variant manager's tags
 * render as `#<id>` skeletons even though the names are right there in the
 * response. A browse row is the only place those entities appear, so the only
 * way to give the tag what it reads is to project the row back out.
 *
 * `data` must satisfy the fragment completely. `watchFragment` is all-or-nothing
 * — one missing field leaves `complete` false and the tag stays a skeleton — so
 * a partial write is worse than none.
 *
 * An entity already in the cache is left alone. A real query's entry is
 * authoritative and must not be overwritten by a browse row's projection of it,
 * and skipping the write avoids waking every watcher of that entity.
 */
export function writeCachedEntity(
  apollo: Apollo,
  typename: string,
  data: LinkableEntity & Record<string, unknown>
): void {
  if (!isTaggableTypename(typename)) return
  if (readCachedEntity(apollo, typename, data.id)) return
  apollo.client.writeFragment({
    id: `${typename}:${data.id}`,
    fragment: tagSpecFor(typename).fragment,
    data,
  })
}
