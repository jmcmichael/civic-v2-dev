import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';

export type CvcFieldGroupLayoutWrapperConfig = Partial<WrapperConfig>

type WrapperConfig = {

}

@Component({
  selector: 'cvc-field-group',
  templateUrl: './field-group.wrapper.html',
  styleUrls: ['./field-group.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFieldGroupWrapper
  extends FieldWrapper<FormlyFieldConfig<any>>
  implements OnInit
{
  fieldGroupConfig!: WrapperConfig
  get errorState() {
    return this.showError ? 'error' : ''
  }

  constructor() {
    super()
  }

  ngOnInit(): void {}
}
