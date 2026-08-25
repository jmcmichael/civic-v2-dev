import { NgModule } from '@angular/core'
import { CvcSourceSuggestionsTableComponent } from './source-suggestions-table.component'

/**
 * Import shim: the facade is standalone, but the embed modules import this
 * NgModule by name. Keeping it means zero churn at the embed sites.
 */
@NgModule({
  imports: [CvcSourceSuggestionsTableComponent],
  exports: [CvcSourceSuggestionsTableComponent],
})
export class CvcSourceSuggestionsTableModule {}
