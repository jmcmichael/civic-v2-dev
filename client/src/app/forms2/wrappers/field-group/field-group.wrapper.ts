import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';
import { NzFormLayoutType } from 'ng-zorro-antd/form';

export type CvcFieldGroupWrapperConfig = Partial<GroupConfig>
export type CvcFormFieldFlowType = 'block' | 'inline'

type GroupConfig = {
  layout: CvcFormFieldFlowType
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

  get errorState() {
    return this.showError ? 'error' : ''
  }

  groupLayout!: CvcFormFieldFlowType

  ngOnInit(): void {
    this.groupLayout = this.props.layout || 'block'
  }
}
