import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFieldBase } from '@app/forms/select'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

export interface CvcBaseBooleanRadioFieldProps extends CvcColWrapperProps {
  labels: { true: string; false: string }
}

export interface CvcBaseBooleanRadioFieldConfig extends FormlyFieldConfig<CvcBaseBooleanRadioFieldProps> {
  type: 'base-boolean-radio' | Type<CvcBaseBooleanRadioField>
}

@Component({
  selector: 'cvc-base-boolean-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule, NzRadioModule],
  templateUrl: './boolean-radio.type.html',
})
export class CvcBaseBooleanRadioField extends CvcFieldBase<
  Maybe<boolean>,
  FieldTypeConfig<CvcBaseBooleanRadioFieldProps>
> {
  defaultOptions: Partial<FieldTypeConfig<CvcBaseBooleanRadioFieldProps>> = {
    props: {
      labels: { true: 'Yes', false: 'No' },
      hideLabel: true,
    },
  }
}
