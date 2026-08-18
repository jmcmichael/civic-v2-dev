import { NgModule } from '@angular/core'
import { CvcVariantGroupsTableComponent } from './variant-groups-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcVariantGroupsTableComponent],
  exports: [CvcVariantGroupsTableComponent],
})
export class CvcVariantGroupsTableModule {}
