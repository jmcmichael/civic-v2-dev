import { Component } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';

export interface CvcFormCardWrapperProps extends FormlyFieldProps {
  title: string;
}

@Component({
  selector: 'cvc-form-card-wrapper',
  templateUrl: './form-card.wrapper.html',
  styleUrls: ['./form-card.wrapper.less']
})
export class CvcFormCardWrapper extends FieldWrapper<FormlyFieldConfig<CvcFormCardWrapperProps>> {

  constructor() {
    super()
  }
  get errorState() {
    return this.showError ? 'error' : '';
  }
}
