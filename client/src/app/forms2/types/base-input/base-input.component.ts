import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { DisplayStringTag } from '@app/forms2/mixins/display-string-tag.mixin'
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
  DisplayStringTag
)

@Component({
  selector: 'cvc-base-input',
  templateUrl: './base-input.component.html',
  styleUrls: ['./base-input.component.less'],
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
    this.configureDisplayStringTag()
  } // ngAfterViewInit
}
