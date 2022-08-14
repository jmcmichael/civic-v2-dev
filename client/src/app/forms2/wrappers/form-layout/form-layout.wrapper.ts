import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import { NzButtonGroupSize, NzButtonSize } from 'ng-zorro-antd/button';
import { NzSizeDSType } from 'ng-zorro-antd/core/types';

export interface CvcFormLayoutWrapperProps extends FormlyFieldProps {
  title: string
  submitLabel: string
  showFormStatus: boolean
}

const defaultProps = {
  title: 'Form Card',
  submitLabel: 'Submit',
  showFormStatus: false,
};

@Component({
  selector: 'cvc-form-layout-wrapper',
  templateUrl: './form-layout.wrapper.html',
  styleUrls: ['./form-layout.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormLayoutWrapper extends FieldWrapper<FormlyFieldConfig<CvcFormLayoutWrapperProps>> implements OnInit {
  get errorState() {
    return this.showError ? 'error' : '';
  }

  ngOnInit(): void {
    this.props.title = this.props.title || defaultProps.title;
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel;
    this.props.showFormStatus = this.props.showFormStatus || defaultProps.showFormStatus;
  }
}
