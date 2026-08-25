import { NgModule } from '@angular/core'
import { CvcFeaturesTableComponent } from './features-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcFeaturesTableComponent],
  exports: [CvcFeaturesTableComponent],
})
export class CvcFeaturesTableModule {}
