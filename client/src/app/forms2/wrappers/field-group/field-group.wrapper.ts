import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';
import { NzFormLayoutType } from 'ng-zorro-antd/form';

export type CvcFieldGroupWrapperConfig = Partial<GroupConfig>

type GroupConfig = {
  formLayout?: NzFormLayoutType
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

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.props.wrapper.group = {
      ...(this.props.wrapper.group ? this.props.wrapper.group : undefined)
    }
  }
}
