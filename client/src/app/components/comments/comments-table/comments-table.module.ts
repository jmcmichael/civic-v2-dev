import { NgModule } from '@angular/core'
import { CvcCommentsTableComponent } from './comments-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcCommentsTableComponent],
  exports: [CvcCommentsTableComponent],
})
export class CvcCommentsTableModule {}
