/**
 * The configurable entity table.
 *
 * A host builds an `EntityTableSpec` with `entityTableConfig()` — which
 * type-checks columns, filters and sorts against the query's generated types —
 * and renders `<cvc-entity-table [spec]="...">`. See
 * `forms/types/evidence-select/evidence-manager` for a complete example.
 *
 * Consumer surface: `CvcEntityTableComponent`, `entityTableConfig`,
 * `enumFilterOptions`, the column/cell/filter types, and `CvcCellDirective`
 * for one-off cell templates. The scroll directive, filter widgets and
 * connection helpers are internals of the component, exported for tests.
 */
export { CvcEntityTableComponent } from './entity-table.component'
export type { CvcTableRequestError } from './entity-table.component'
export { CvcCellDirective } from './cell.directive'
export type { CvcCellContext } from './cell.directive'
export { CvcTableFilterInputComponent } from './filters/table-filter-input.component'
export { CvcEnumFilterMenuComponent } from './filters/enum-filter-menu.component'
export {
  CvcTableScrollObserverDirective,
  nextFetch,
} from './table-scroll.directive'
export type { CvcScrollEvent, CvcScrollFetch } from './table-scroll.directive'
export { connectionNodes, displayedCount } from './connection.types'
export type { CvcConnection, CvcEdge, CvcPageInfo } from './connection.types'
export { enumFilterOptions } from './enum-filter-options'
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
  CvcFilterChange,
  CvcFilterState,
  CvcNumericFilter,
  CvcSelectCell,
  CvcSortState,
  CvcTableSettings,
  CvcTextCell,
  CvcTextFilter,
  CvcTextTagCell,
} from './entity-table.types'
export { DEFAULT_EMPTY_VALUE } from './entity-table.types'
