import { DateSortColumns, Maybe } from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CivicTimeagoFormatter } from '@app/core/pipes/timeago-formatter'
import { CvcCommentCellComponent } from './comments-table-comment-cell.component'
import { CvcCommentCommenterCellComponent } from './comments-table-commenter-cell.component'
import { CvcCommentSubjectCellComponent } from './comments-table-subject-cell.component'
import { CommentsBrowseGQL } from './comments-table.query.gql.generated'

const timeAgo = new CivicTimeagoFormatter()

/** The query variables a host page scopes the table with. */
export interface CommentsTableScope {
  ids?: Maybe<number[]>
}

/**
 * The comments browse table, as configuration. No filters at all — the
 * legacy table never had a filter row (only sort, on Created).
 *
 * Comment, Subject and Commenter are all `kind: 'custom'` cells: `Comment`
 * and `User` are not taggable typenames, and `commentable` is a ~20-member
 * GraphQL union needing per-typename bespoke rendering — see
 * `comments-table-subject-cell.component.ts` for the full reasoning.
 *
 * No downloader: the legacy table never had one either (its card-extra
 * template has only the loading tag and no-more-rows).
 */
export function commentsTableConfig(
  query: CommentsBrowseGQL,
  title: Maybe<string>,
  scope: CommentsTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.comments,
    columns: [
      {
        key: 'comment',
        label: 'Comment',
        width: '125px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcCommentCellComponent),
        },
      },
      {
        key: 'subject',
        label: 'Subject',
        width: '170px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcCommentSubjectCellComponent),
        },
      },
      {
        key: 'commentText',
        label: 'Comment Text',
        width: '325px',
        cell: { kind: 'text', text: (row) => row.comment, tooltip: true },
      },
      {
        key: 'commenter',
        label: 'Commenter',
        width: '200px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcCommentCommenterCellComponent),
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        width: '100px',
        fixed: 'right',
        cell: { kind: 'text', text: (row) => timeAgo.transform(row.createdAt) },
        sort: {
          column: DateSortColumns.Created,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}
