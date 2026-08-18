/**
 * The configurable entity table.
 *
 * A host builds an `EntityTableSpec` with `entityTableConfig()` — which
 * type-checks columns, filters and sorts against the query's generated types —
 * and renders `<cvc-entity-table [spec]="...">`. See
 * `forms/types/evidence-select/evidence-manager` for a complete example.
 *
 * Consumer surface: `CvcEntityTableComponent`, `entityTableConfig`,
 * `enumFilterOptions`, and the column/cell/filter types — one-off cells are
 * `kind: 'custom'` columns carrying polymorpheus content in the config
 * (`CvcCustomCell`). The scroll directive, filter widgets and connection
 * helpers are internals of the component, exported for tests.
 *
 * Developer docs live in ./docs: 01-architecture.md (incl. the column-model
 * → ng-zorro mapping), 02-authoring-guide.md, 03-troubleshooting.md.
 */
export { CvcColumnFilterExtraDirective } from './column-filter-extra.directive'
export { CvcEntityTableComponent } from './entity-table.component'
export type { CvcTableRequestError } from './entity-table-query'
export { CvcTableFilterInputComponent } from './filters/table-filter-input.component'
export { CvcEnumFilterMenuComponent } from './filters/enum-filter-menu.component'
export {
  CvcTableScrollObserverDirective,
  nextFetch,
} from './table-scroll.directive'
export type { CvcScrollEvent, CvcScrollFetch } from './table-scroll.directive'
export { connectionNodes, displayedCount } from './connection.types'
export type { CvcConnection, CvcEdge, CvcPageInfo } from './connection.types'
export { enumFilterOptions, groupEnumOptions } from './enum-filter-options'
export type { CvcEnumOptionGroup } from './enum-filter-options'
export { formatCount } from './format'
export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_VAR,
  entityTableConfig,
} from './entity-table-config'
export type {
  CvcSpecColumn,
  CvcTableQuery,
  EntityTableConfig,
  EntityTableSpec,
} from './entity-table-config'
export type {
  CvcCellContext,
  CvcCellSpec,
  CvcColumn,
  CvcColumnFilter,
  CvcColumnPref,
  CvcColumnSort,
  CvcCustomCell,
  CvcEntityTagCell,
  CvcEnumFilter,
  CvcEnumOption,
  CvcEnumTagCell,
  CvcExternalLinkCell,
  CvcFilterChange,
  CvcNumericFilter,
  CvcSelectCell,
  CvcSortState,
  CvcTableSettings,
  CvcTextCell,
  CvcTextFilter,
  CvcTextTagCell,
} from './entity-table.types'
export { DEFAULT_EMPTY_VALUE, SORT_DESCEND_FIRST } from './entity-table.types'
