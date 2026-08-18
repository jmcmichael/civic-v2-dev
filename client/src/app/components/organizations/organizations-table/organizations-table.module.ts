import { NgModule } from '@angular/core'
import { CvcOrganizationsTableComponent } from './organizations-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcOrganizationsTableComponent],
  exports: [CvcOrganizationsTableComponent],
})
export class CvcOrganizationsTableModule {}
