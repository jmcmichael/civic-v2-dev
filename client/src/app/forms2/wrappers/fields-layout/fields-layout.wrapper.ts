import { Component, OnInit } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field';

export interface CvcFieldsLayoutWrapperProps extends FormlyFieldProps {
  title: string
  gutterHorizontal: number
  gutterVertical: number
}

const defaultProps = {
  gutterHorizontal: 8,
  gutterVertical: 8
}

@Component({
  selector: 'cvc-fields-layout',
  templateUrl: './fields-layout.wrapper.html',
  styleUrls: ['./fields-layout.wrapper.less'],
})
export class CvcFieldsLayoutWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFieldsLayoutWrapperProps>>
  implements OnInit
{
  ngOnInit(): void {
    this.props.gutterHorizontal = this.props.gutterHorizontal || defaultProps.gutterHorizontal
    this.props.gutterVertical = this.props.gutterVertical || defaultProps.gutterVertical
  }
}
