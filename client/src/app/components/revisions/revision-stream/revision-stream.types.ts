import {
  Maybe,
  ModeratedInput,
  RevisionStatus,
} from '@app/generated/civic.apollo.types'
import { RevisionStreamQuery } from './revision-stream.query.gql.generated'

/** the revisions connection as the stream document selects it */
export type RevisionStreamConnection = RevisionStreamQuery['revisions']

/** one revision item */
export type RevisionStreamNode = NonNullable<
  RevisionStreamConnection['edges'][number]['node']
>

/** the stream's always-sent scope: the moderated subject */
export interface RevisionStreamScope {
  subject: ModeratedInput
}

/**
 * The facade's user-editable filters — one member per sidebar facet plus
 * the revision-set (group) filter. `undefined` clears a facet: the
 * variable is dropped from the request rather than sent null.
 */
export interface RevisionStreamFilters {
  status: Maybe<RevisionStatus>
  fieldName: Maybe<string>
  originatingUserId: Maybe<number>
  resolvingUserId: Maybe<number>
  revisionSetId: Maybe<number>
}

/** moderation opens on the open work: status NEW, nothing else filtered */
export const revisionStreamDefaultFilters: RevisionStreamFilters = {
  status: RevisionStatus.New,
  fieldName: undefined,
  originatingUserId: undefined,
  resolvingUserId: undefined,
  revisionSetId: undefined,
}
