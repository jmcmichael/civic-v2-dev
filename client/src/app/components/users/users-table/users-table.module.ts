import { NgModule } from '@angular/core'
import { CvcUsersTableComponent } from './users-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcUsersTableComponent],
  exports: [CvcUsersTableComponent],
})
export class CvcUsersTableModule {}
