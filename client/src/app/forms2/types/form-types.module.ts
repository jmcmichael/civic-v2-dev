import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcGeneInputModule } from './gene-input/gene-input.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'

@NgModule({
  imports: [CommonModule, CvcOrgSubmitButtonTypeModule, CvcGeneInputModule],
})
export class CvcFormTypesModule {}
