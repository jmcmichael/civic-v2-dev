import { NgModule } from '@angular/core'
import { CvcVariantsTableComponent } from './variants-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcVariantsTableComponent],
  exports: [CvcVariantsTableComponent],
})
export class CvcVariantsTableModule {}
