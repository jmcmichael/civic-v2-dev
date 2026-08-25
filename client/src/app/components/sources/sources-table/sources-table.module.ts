import { NgModule } from '@angular/core'
import { CvcSourcesTableComponent } from './sources-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcSourcesTableComponent],
  exports: [CvcSourcesTableComponent],
})
export class CvcSourcesTableModule {}
