import { NgModule } from '@angular/core'
import { CvcVariantTypesTableComponent } from './variant-types-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcVariantTypesTableComponent],
  exports: [CvcVariantTypesTableComponent],
})
export class CvcVariantTypesTableModule {}
