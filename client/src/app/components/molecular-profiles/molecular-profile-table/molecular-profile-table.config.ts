import {
  Maybe,
  MolecularProfilesSortColumns,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcMolecularProfileAliasesCellComponent } from './molecular-profile-table-aliases-cell.component'
import { CvcMolecularProfileNameCellComponent } from './molecular-profile-table-name-cell.component'
import { CvcMolecularProfileVariantsCellComponent } from './molecular-profile-table-variants-cell.component'
import { BrowseMolecularProfilesGQL } from './molecular-profile-table.query.gql.generated'

/** The query variables a host page scopes the table with. */
export interface MolecularProfileTableScope {
  ids?: Maybe<number[]>
  variantId?: Maybe<number>
}

/**
 * The molecular profiles browse table, as configuration.
 *
 * Name is `kind: 'custom'`: `MolecularProfile` is a taggable typename, but
 * its `LinkableMolecularProfile` fragment needs `flagged`, which
 * `BrowseMolecularProfile` doesn't have in the schema at all -- see
 * `molecular-profile-table-name-cell.component.ts`.
 *
 * Diseases and Therapies are the generic `entity-tag` kind: the row's
 * fields resolve to the schema's synthetic `LinkableDisease`/
 * `LinkableTherapy` wrapper types, not `Disease`/`Therapy` directly, but
 * every field the real `LinkableDisease`/`LinkableTherapy` (`@app/tags`)
 * fragments need (id, name, link, deprecated) is already selected -- `ref`/
 * `seed` address them as `Disease`/`Therapy` explicitly regardless of the
 * wire response's own typename, the same way every other column in this
 * framework already does. This is a faithful equivalent of the legacy
 * `cvc-tag-overflow(disease|therapy)` columns, not an upgrade: that widget
 * already delegated to the same bespoke `cvc-disease-tag`/`cvc-therapy-tag`
 * components (with their own popovers) that back `ENTITY_TAG_SPECS`.
 *
 * Aliases and Variants are `kind: 'custom'`: Aliases is a plain string
 * pileup (see the aliases cell component). Variants resolves to the
 * synthetic `LinkableVariant` type (not a taggable `Variant`/`GeneVariant`/
 * ... typename) and each tag is a variant+feature composite no single-
 * typename generic cell can express -- see the variants cell component,
 * which wraps the legacy `cvc-tag-overflow(variant-feature)` widget
 * directly rather than reimplementing it.
 *
 * Unlike every other migrated browse table, the legacy opening query never
 * set `sortBy` and no column header carried a default `nzSortOrder` -- so
 * none of the four sortable columns declares `default` here either.
 */
export function molecularProfileTableConfig(
  query: BrowseMolecularProfilesGQL,
  title: Maybe<string>,
  scope: MolecularProfileTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
      variantId: scope.variantId ?? undefined,
    },
    connection: (data) => data?.browseMolecularProfiles,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '200px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcMolecularProfileNameCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'molecularProfileName',
          placeholder: 'Filter Name',
        },
      },
      {
        key: 'aliases',
        label: 'Aliases',
        width: '110px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcMolecularProfileAliasesCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'molecularProfileAlias',
          placeholder: 'Filter Aliases',
        },
      },
      {
        key: 'variants',
        label: 'Variants',
        width: '350px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcMolecularProfileVariantsCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'variantName',
          placeholder: 'Filter Variant Names',
        },
      },
      {
        key: 'diseases',
        label: 'Diseases',
        width: '250px',
        cell: {
          kind: 'entity-tag',
          ref: (row) =>
            row.diseases.map((d) => ({
              __typename: 'Disease' as const,
              id: d.id,
            })),
          seed: (row) =>
            row.diseases.map((d) => ({
              __typename: 'Disease' as const,
              id: d.id,
              name: d.name,
              link: d.link,
              deprecated: d.deprecated,
            })),
          maxTags: 1,
          truncateLabel: '150px',
        },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '180px',
        cell: {
          kind: 'entity-tag',
          ref: (row) =>
            row.therapies.map((t) => ({
              __typename: 'Therapy' as const,
              id: t.id,
            })),
          seed: (row) =>
            row.therapies.map((t) => ({
              __typename: 'Therapy' as const,
              id: t.id,
              name: t.name,
              link: t.link,
              deprecated: t.deprecated,
            })),
          maxTags: 1,
          truncateLabel: '125px',
        },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
        },
      },
      {
        key: 'molecularProfileScore',
        label: 'Score',
        tooltip: 'Molecular Profile Score',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.molecularProfileScore },
        sort: { column: MolecularProfilesSortColumns.MolecularProfileScore },
      },
      {
        key: 'evidenceItemCount',
        label: 'Count',
        tooltip: 'Evidence Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: { column: MolecularProfilesSortColumns.EvidenceItemCount },
      },
      {
        key: 'assertionCount',
        label: 'Count',
        tooltip: 'Assertion Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.assertionCount },
        sort: { column: MolecularProfilesSortColumns.AssertionCount },
      },
      {
        key: 'variantCount',
        label: 'Count',
        tooltip: 'Variant Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.variantCount },
        sort: { column: MolecularProfilesSortColumns.VariantCount },
      },
    ],
  })
}
