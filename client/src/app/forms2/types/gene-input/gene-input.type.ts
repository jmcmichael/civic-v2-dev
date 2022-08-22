import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field';

interface CvcGeneInputFieldProps extends FormlyFieldProps {}

export interface CvcGeneInputFieldConfig extends FormlyFieldConfig<CvcGeneInputFieldProps> {
  // type: 'gene-input' | Type<CvcGeneInputField>;
}

@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField extends FieldType<FieldTypeConfig<CvcGeneInputFieldProps>> {}
