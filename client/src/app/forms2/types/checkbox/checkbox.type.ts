import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field';

interface CheckboxProps extends FormlyFieldProps {
  indeterminate?: boolean;
}

export interface FormlyCheckboxFieldConfig extends FormlyFieldConfig<CheckboxProps> {
  type: 'checkbox' | Type<CvcCheckboxField>;
}

@Component({
  selector: 'cvc-checkbox',
  templateUrl: './checkbox.type.html',
  styleUrls: ['./checkbox.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcCheckboxField extends FieldType<FieldTypeConfig<CheckboxProps>> {
  override defaultOptions = {
    props: {
      indeterminate: true,
      hideLabel: true,
    },
  };
}
