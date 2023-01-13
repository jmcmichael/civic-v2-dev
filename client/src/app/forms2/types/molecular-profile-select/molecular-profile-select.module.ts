import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcMolecularProfileSelectField } from './molecular-profile-select.type'
import { ConfigOption, FieldTypeConfig } from '@ngx-formly/core'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'molecular-profile-select',
      wrappers: ['form-field'],
      component: CvcMolecularProfileSelectField,
    },
    {
      name: 'mp-multi-select',
      wrappers: ['form-field'],
      component: CvcMolecularProfileSelectField,
      defaultOptions: <
        Partial<FieldTypeConfig<CvcMolecularProfileSelectField>>
      >{
        props: {
          label: 'Molecular Profiles',
          isMultiSelect: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcMolecularProfileSelectField],
  imports: [CommonModule],
})
export class MolecularProfileSelectModule {}
