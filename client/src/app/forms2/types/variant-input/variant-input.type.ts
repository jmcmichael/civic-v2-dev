import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'

interface CvcVariantInputFieldProps extends FormlyFieldProps {}

export interface CvcVariantInputFieldConfig
  extends FormlyFieldConfig<CvcVariantInputFieldProps> {
  // type: 'variant-input' | Type<CvcVariantInputField>;
}

@Component({
  selector: 'cvc-variant-input',
  templateUrl: './variant-input.type.html',
  styleUrls: ['./variant-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcVariantInputField
  extends FieldType<FieldTypeConfig<CvcVariantInputFieldProps>>
{

  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant'
    },
    hooks: {
      onInit: (field) => {
        console.log('variant-input hooks.onInit()')
      }
    }
  }

  constructor() {
    super()
  }

}
