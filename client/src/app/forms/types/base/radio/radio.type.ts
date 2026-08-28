import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFieldBase } from '@app/forms/select'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import {
  FormlySelectOption,
  FormlySelectOptionsPipe,
} from '@ngx-formly/core/select'
import { NzSizeLDSType } from 'ng-zorro-antd/core/types'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

export interface CvcBaseRadioFieldProps extends CvcColWrapperProps {
  size: NzSizeLDSType
  type: 'radio' | 'button'
  options: FormlySelectOption[]
}

export interface CvcBaseRadioFieldConfig extends FormlyFieldConfig<CvcBaseRadioFieldProps> {
  type: 'base-radio' | Type<CvcBaseRadioField>
}

@Component({
  selector: 'cvc-base-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzRadioModule,
    FormlySelectOptionsPipe,
    AsyncPipe,
  ],
  templateUrl: './radio.type.html',
})
export class CvcBaseRadioField extends CvcFieldBase<
  Maybe<number | string | boolean>,
  FieldTypeConfig<CvcBaseRadioFieldProps>
> {
  defaultOptions: Partial<FieldTypeConfig<CvcBaseRadioFieldProps>> = {
    props: {
      size: 'default',
      type: 'radio',
      options: [],
    },
  }
}
