import { NgModule } from '@angular/core'
import { CvcMolecularProfilesTableComponent } from './molecular-profile-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcMolecularProfilesTableComponent],
  exports: [CvcMolecularProfilesTableComponent],
})
export class CvcMolecularProfilesTableModule {}
