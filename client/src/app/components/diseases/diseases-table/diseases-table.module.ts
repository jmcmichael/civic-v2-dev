import { NgModule } from '@angular/core'
import { CvcDiseasesTableComponent } from './diseases-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcDiseasesTableComponent],
  exports: [CvcDiseasesTableComponent],
})
export class CvcDiseasesTableModule {}
