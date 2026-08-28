import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFieldBase } from '@app/forms/select'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

export type CvcBaseCheckboxFieldOptions = Partial<
  FieldTypeConfig<CvcBaseCheckboxFieldProps>
>

export interface CvcBaseCheckboxFieldProps extends CvcColWrapperProps {
  indeterminate?: boolean
}

export interface FormlyCheckboxFieldConfig extends FormlyFieldConfig<CvcBaseCheckboxFieldProps> {
  type: 'base-checkbox' | Type<CvcBaseCheckboxField>
}

@Component({
  selector: 'cvc-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule, NzCheckboxModule],
  templateUrl: './checkbox.type.html',
})
export class CvcBaseCheckboxField extends CvcFieldBase<
  Maybe<boolean>,
  FieldTypeConfig<CvcBaseCheckboxFieldProps>
> {
  defaultOptions: CvcBaseCheckboxFieldOptions = {
    props: {
      indeterminate: true,
      hideLabel: true,
    },
  }
}
