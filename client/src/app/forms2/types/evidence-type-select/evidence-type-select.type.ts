import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'

interface CvcEvidenceTypeSelectFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcEvidenceTypeSelectFieldConfig
  extends FormlyFieldConfig<CvcEvidenceTypeSelectFieldProps> {
  type: 'evidence-type-select' | Type<CvcEvidenceTypeSelectField>
}

@Component({
  selector: 'cvc-evidence-type-select',
  templateUrl: './evidence-type-select.type.html',
  styleUrls: ['./evidence-type-select.type.less'],
})
export class CvcEvidenceTypeSelectField
  extends FieldType<FieldTypeConfig<CvcEvidenceTypeSelectFieldProps>>
  implements AfterViewInit
{
  constructor() {
    super()
  }

  ngAfterViewInit(): void {}
}
