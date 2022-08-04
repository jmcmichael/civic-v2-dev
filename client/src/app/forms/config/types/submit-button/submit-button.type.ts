import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import {TypeOption} from "@ngx-formly/core/lib/models";

@Component({
  selector: 'cvc-submit-button-type',
  templateUrl: './submit-button.type.html',
  styleUrls: ['./submit-button.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitButtonComponent extends FieldType<FieldTypeConfig> {
  defaultOptions = {
    templateOptions: {
      submitLabel: 'Submit',
      submitSize: 'small'
    }
  }

  constructor() {
    super();
  }
}

export const SubmitButtonTypeOption: TypeOption = {
  name: 'submit-button',
  component: SubmitButtonComponent
}
