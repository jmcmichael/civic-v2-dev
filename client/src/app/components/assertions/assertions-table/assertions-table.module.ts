import { NgModule } from '@angular/core'
import { CvcAssertionsTableComponent } from './assertions-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcAssertionsTableComponent],
  exports: [CvcAssertionsTableComponent],
})
export class CvcAssertionsTableModule {}
