import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import { NzButtonGroupSize } from 'ng-zorro-antd/button';
import { NzSizeDSType } from 'ng-zorro-antd/core/types';

export interface CvcFormCardWrapperProps extends FormlyFieldProps {
  title: string;
  cardSize: NzSizeDSType;
  bordered: boolean;
  submitLabel: string;
  submitSize: NzButtonGroupSize;
  observeParentModel: boolean;
}

@Component({
  selector: 'cvc-form-card-wrapper',
  templateUrl: './form-card.wrapper.html',
  styleUrls: ['./form-card.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormCardWrapper extends FieldWrapper<FormlyFieldConfig<CvcFormCardWrapperProps>> implements OnInit {

  constructor() {
    super();
  }

  get errorState() {
    return this.showError ? 'error' : '';
  }

  ngOnInit(): void {
    console.log('form-card onInit() called.');
    // set defaults
    this.props.title = this.props.title || 'Form Card';
    this.props.cardSize = this.props.cardSize || 'default';
    this.props.bordered = this.props.bordered || true;
    this.props.submitLabel = this.props.submitLabel || 'Submit';
    this.props.submitSize = this.props.submitSize || 'default';
    this.props.observeParentModel = this.props.observeParentModel || false;
  }
}
