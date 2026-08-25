import { NgModule } from '@angular/core'
import { CvcRevisionsTableComponent } from './revisions-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcRevisionsTableComponent],
  exports: [CvcRevisionsTableComponent],
})
export class CvcRevisionsTableModule {}
