import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';

export interface CvcOrgSubmitButtonTypeProps extends FormlyFieldProps {
  submitLabel: string
}

const defaultProps = {
  submitLabel: 'Submit'
}

@Component({
  selector: 'cvc-org-submit-button-type',
  templateUrl: './org-submit-button.type.html',
  styleUrls: ['./org-submit-button.type.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcOrgSubmitButtonComponent extends FieldType<FieldTypeConfig> implements OnInit {

  ngOnInit(): void {
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
  }

}
