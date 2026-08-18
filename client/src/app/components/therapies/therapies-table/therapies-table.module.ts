import { NgModule } from '@angular/core'
import { CvcTherapiesTableComponent } from './therapies-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcTherapiesTableComponent],
  exports: [CvcTherapiesTableComponent],
})
export class CvcTherapiesTableModule {}
