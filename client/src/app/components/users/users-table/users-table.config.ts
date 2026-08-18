import {
  Maybe,
  UserRole,
  UsersSortColumns,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CivicTimeagoFormatter } from '@app/core/pipes/timeago-formatter'
import { EnumToTitlePipe } from '@app/core/pipes/enum-to-title-pipe'
import { CvcUserCellComponent } from './users-table-user-cell.component'
import { CvcUserOrganizationsCellComponent } from './users-table-organizations-cell.component'
import { UsersBrowseGQL } from './users-table.query.gql.generated'

const timeAgo = new CivicTimeagoFormatter()
const enumToTitle = new EnumToTitlePipe()

/**
 * `enumFilterOptions()`'s `InputEnum` is closed over the evidence/variant/
 * assertion domain enums `formatEvidenceEnum` knows how to label -- it
 * does not (and should not) widen for an unrelated administrative enum
 * like `UserRole`. Built by hand instead, with the same `enumToTitle`
 * formatting the Role column's text cell uses.
 */
const USER_ROLE_OPTIONS = Object.values(UserRole).map((value) => ({
  label: enumToTitle.transform(value),
  value,
}))

/** The query variables a host page scopes the table with. */
export interface UsersTableScope {
  ids?: Maybe<number[]>
}

/**
 * The users browse table, as configuration.
 *
 * User and Organizations are both `kind: 'custom'` cells: `User` is not a
 * taggable typename, and `cvc-tag-overflow` (Organizations) is a separate
 * pileup mechanism the generic `entity-tag` kind cannot reach either way —
 * same reasoning as the organizations browse table.
 *
 * The Organizations filter maps to the nested `organization: {name}` input
 * object, not a flat scalar — `transform` builds that shape.
 */
export function usersTableConfig(
  query: UsersBrowseGQL,
  title: Maybe<string>,
  scope: UsersTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.browseUsers,
    columns: [
      {
        key: 'user',
        label: 'User',
        width: '120px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcUserCellComponent),
        },
        // the legacy Name column folded in here per review: the tag already
        // shows the username, so this column carries its sort and filter,
        // and the cell highlights the active filter via ctx.filterText()
        sort: { column: UsersSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'organizations',
        label: 'Organizations',
        width: '300px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcUserOrganizationsCellComponent),
        },
        filter: {
          kind: 'text',
          var: 'organization',
          placeholder: 'Filter Organization',
          transform: (value) => (value ? { name: value } : undefined),
        },
      },
      {
        key: 'role',
        label: 'Role',
        width: '90px',
        cell: { kind: 'text', text: (row) => enumToTitle.transform(row.role) },
        sort: { column: UsersSortColumns.Role },
        filter: {
          kind: 'enum',
          control: 'select',
          placeholder: 'Any',
          var: 'role',
          options: USER_ROLE_OPTIONS,
        },
      },
      {
        key: 'mostRecentActivityTimestamp',
        label: 'Last Action',
        width: '85px',
        align: 'right',
        cell: {
          kind: 'text',
          text: (row) =>
            row.mostRecentActivityTimestamp
              ? timeAgo.transform(row.mostRecentActivityTimestamp)
              : undefined,
        },
        sort: { column: UsersSortColumns.LastAction, default: 'descend' },
      },
      {
        key: 'evidenceCount',
        label: 'CT.',
        tooltip: 'Evidence Count',
        labelIcon: 'civic-evidence',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceCount },
        sort: { column: UsersSortColumns.EvidenceCount },
      },
      {
        key: 'revisionCount',
        label: 'CT.',
        tooltip: 'Revision Count',
        labelIcon: 'civic-revision',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.revisionCount },
        sort: { column: UsersSortColumns.RevisionCount },
      },
    ],
  })
}
