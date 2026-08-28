import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFieldBase } from '@app/forms/select'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

export type CvcTagInputOptions = Partial<FieldTypeConfig<CvcTagInputProps>>

export interface CvcTagInputProps extends CvcColWrapperProps {
  isMultiInput?: boolean
}

export interface CvcTagInputConfig extends FormlyFieldConfig<CvcTagInputProps> {
  type: 'tag-input' | 'tag-input-item' | Type<CvcTagInputField>
}

@Component({
  selector: 'cvc-tag-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
  ],
  templateUrl: './tag-input.type.html',
  styleUrl: './tag-input.type.less',
})
export class CvcTagInputField extends CvcFieldBase<
  Maybe<string | number>,
  FieldTypeConfig<CvcTagInputProps>
> {
  defaultOptions: CvcTagInputOptions = {
    props: {
      label: 'Enter value',
    },
  }
}
