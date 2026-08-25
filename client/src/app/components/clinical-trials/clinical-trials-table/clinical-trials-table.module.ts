import { NgModule } from '@angular/core'
import { CvcClinicalTrialsTableComponent } from './clinical-trials-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcClinicalTrialsTableComponent],
  exports: [CvcClinicalTrialsTableComponent],
})
export class CvcClinicalTrialsTableModule {}
