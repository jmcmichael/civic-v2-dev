import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Maybe, Organization } from '@app/generated/civic.apollo';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcOrgSubmitButtonComponent extends FieldType<FieldTypeConfig> implements OnInit {
  _selectedOrg: Maybe<Organization> = undefined;
  get selectedOrg(): Maybe<Organization> {
    return this._selectedOrg;
  }

  set selectedOrg(org: Maybe<Organization>) {
    this._selectedOrg = org;
    this.formControl.setValue(org);
  }

  ngOnInit(): void {
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
  }

}
