import {
  Maybe,
  OrganizationSortColumns,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CivicTimeagoFormatter } from '@app/core/pipes/timeago-formatter'
import { CvcOrganizationChildOrgsCellComponent } from './organizations-table-child-orgs-cell.component'
import { CvcOrganizationNameCellComponent } from './organizations-table-name-cell.component'
import { OrganizationsBrowseGQL } from './organizations-table.query.gql.generated'

const timeAgo = new CivicTimeagoFormatter()

/**
 * The organizations browse table, as configuration. No host scope: the
 * legacy table has no `ids`/entity-id input and only one embed site
 * (organizations-home).
 *
 * Neither Organization nor its Sub Organizations column has a built-in
 * cell kind fit: `Organization` is not a taggable typename (unlike
 * phenotypes/variant types), and `cvc-tag-overflow` is a separate,
 * non-cache-driven pileup mechanism the generic `entity-tag` kind cannot
 * reach either way — both are `kind: 'custom'` wrapping the existing
 * bespoke components, same reasoning as clinical trials' NCT ID.
 *
 * The legacy `id`-filter half of `initialUserFilters` had no template
 * control and no external consumer (grepped) — dead, not carried forward.
 */
export function organizationsTableConfig(
  query: OrganizationsBrowseGQL,
  title: Maybe<string>
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    connection: (data) => data?.browseOrganizations,
    columns: [
      {
        key: 'name',
        label: 'Organization',
        width: '300px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcOrganizationNameCellComponent),
        },
        sort: { column: OrganizationSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'memberCount',
        label: 'Members',
        width: '100px',
        cell: { kind: 'text', text: (row) => row.memberCount },
        sort: { column: OrganizationSortColumns.MemberCount },
      },
      {
        key: 'childOrganizations',
        label: 'Sub Organizations',
        width: '320px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcOrganizationChildOrgsCellComponent
          ),
        },
      },
      {
        key: 'activityCount',
        label: 'Actions',
        width: '80px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.activityCount },
        sort: { column: OrganizationSortColumns.ActivityCount },
      },
      {
        key: 'mostRecentActivityTimestamp',
        label: 'Last Action',
        width: '125px',
        fixed: 'right',
        align: 'right',
        cell: {
          kind: 'text',
          text: (row) =>
            row.mostRecentActivityTimestamp
              ? timeAgo.transform(row.mostRecentActivityTimestamp)
              : undefined,
        },
        sort: { column: OrganizationSortColumns.MostRecentActivityTimestamp },
      },
    ],
  })
}
