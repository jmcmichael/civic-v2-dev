import { AfterViewInit, Component, OnInit, Type } from '@angular/core'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'

interface CvcClinicalSignificanceSelectFieldProps extends FormlyFieldProps {
  placeholder: string
}

export interface CvcClinicalSignificanceSelectFieldConfig
  extends FormlyFieldConfig<CvcClinicalSignificanceSelectFieldProps> {
  type: 'evidence-type-select' | Type<CvcClinicalSignificanceSelectField>
}

@Component({
  selector: 'cvc-clinical-significance-select',
  templateUrl: './clinical-significance-select.type.html',
  styleUrls: ['./clinical-significance-select.type.less'],
})
export class CvcClinicalSignificanceSelectField
  extends FieldType<FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>>
  implements AfterViewInit
{
  constructor() {
    super()
  }

  ngAfterViewInit(): void {}
}
