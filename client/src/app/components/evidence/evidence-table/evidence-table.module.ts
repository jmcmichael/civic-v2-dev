import { NgModule } from '@angular/core'
import { CvcEvidenceTableComponent } from './evidence-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcEvidenceTableComponent],
  exports: [CvcEvidenceTableComponent],
})
export class CvcEvidenceTableModule {}
