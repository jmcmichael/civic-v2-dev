import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { StringTagField } from '@app/forms2/mixins/string-tag-field.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import mixin from 'ts-mixin-extended'

export type CvcBaseInputFieldOptions = Partial<
  FieldTypeConfig<CvcBaseInputFieldProps>
>
export interface CvcBaseInputFieldProps extends FormlyFieldProps {
}

export interface CvcBaseInputFieldConfig
  extends FormlyFieldConfig<CvcBaseInputFieldProps> {
  type: 'base-input' | 'base-input-item' | Type<CvcBaseInputField>
}

const BaseInputMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcBaseInputFieldProps>,
    Maybe<string | number>
  >(),
  StringTagField
)

@Component({
  selector: 'cvc-base-input',
  templateUrl: './base-input.type.html',
  styleUrls: ['./base-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcBaseInputField extends BaseInputMixin implements AfterViewInit {
  defaultOptions: Partial<FieldTypeConfig<CvcBaseInputFieldProps>> = {
    modelOptions: {
      // update model when focus leaves field
      // (template's keydown.enter listener blurs the field, updating the model)
      updateOn: 'blur',
    },
    props: {
      label: 'Enter value',
    },
  }

  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    this.configureBaseField()
    this.configureStringTagField()
  } // ngAfterViewInit
}
