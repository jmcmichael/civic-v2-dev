import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base-DEPRECATED'
import { StringTagField } from '@app/forms2/mixins/string-tag-field.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import mixin from 'ts-mixin-extended'

export interface CvcBaseInputFieldProps extends FormlyFieldProps {
  isRepeatItem: boolean
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
      updateOn: 'blur', // update model when focus leaves field (see enter keydown.enter EventEmitter in template)
    },
    props: {
      label: 'Enter value',
      isRepeatItem: false,
    },
  }

  constructor(public injector: Injector) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField()
    this.configureStringTagField()
  } // ngAfterViewInit
}
