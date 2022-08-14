import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
    FieldWrapper,
    FormlyFieldConfig,
    FormlyFieldProps
} from '@ngx-formly/core'
import { Observable, Subscription } from 'rxjs'
import { tag } from 'rxjs-spy/operators'

export interface CvcFormLayoutWrapperProps extends FormlyFieldProps {
  title: string
  submitLabel: string
  showFormStatus: boolean
}
const defaultProps = {
  title: 'Form Card',
  submitLabel: 'Submit',
  showFormStatus: false,
}
@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'cvc-form-layout-wrapper',
  templateUrl: './form-layout.wrapper.html',
  styleUrls: ['./form-layout.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFormLayoutWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFormLayoutWrapperProps>>
  implements OnInit
{
  subscriptions!: Subscription[]
  valueChange$: Maybe<Observable<any>>
  statusChange$: Maybe<Observable<any>>
  constructor(cdr: ChangeDetectorRef) {
    super()
  }
  get errorState() {
    return this.showError ? 'error' : ''
  }

  ngOnInit(): void {
    this.props.title = this.props.title || defaultProps.title
    this.props.submitLabel = this.props.submitLabel || defaultProps.submitLabel
    this.props.showFormStatus =
      this.props.showFormStatus || defaultProps.showFormStatus
  }
}
