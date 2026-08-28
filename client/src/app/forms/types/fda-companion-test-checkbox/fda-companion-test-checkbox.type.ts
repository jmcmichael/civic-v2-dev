import { ChangeDetectionStrategy, Component, Type, effect } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFieldBase } from '@app/forms/select'
import { fieldOf } from '@app/forms/states/base.state'
import { CvcFormFieldExtraType } from '@app/forms/wrappers/form-field/form-field.wrapper'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

export type CvcFdaCompanionTestCheckboxFieldOptions = Partial<
  FieldTypeConfig<CvcFdaCompanionTestCheckboxFieldProps>
>

export interface CvcFdaCompanionTestCheckboxFieldProps extends CvcColWrapperProps {
  indeterminate?: boolean
  extraType?: CvcFormFieldExtraType
}

export interface CvcFdaCompanionTestCheckboxFieldConfig extends FormlyFieldConfig<CvcFdaCompanionTestCheckboxFieldProps> {
  type: 'fda-companion-test-checkbox' | Type<CvcFdaCompanionTestCheckboxField>
}

const DEFAULT_DESCRIPTION =
  'Select Yes if an FDA approved companion test exists for the variant and therapy associated with the Assertion (such as tests listed <a href="https://www.fda.gov/medical-devices/in-vitro-diagnostics/list-cleared-or-approved-companion-diagnostic-devices-in-vitro-and-imaging-tools" target="_blank">here</a>).'

/** A companion test is only meaningful once regulatory approval is claimed. */
@Component({
  selector: 'cvc-fda-companion-test-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule, NzCheckboxModule],
  templateUrl: './fda-companion-test-checkbox.type.html',
})
export class CvcFdaCompanionTestCheckboxField extends CvcFieldBase<
  Maybe<boolean>,
  FieldTypeConfig<CvcFdaCompanionTestCheckboxFieldProps>
> {
  defaultOptions: CvcFdaCompanionTestCheckboxFieldOptions = {
    props: {
      hideLabel: false,
      label: 'FDA Companion Test',
      description: DEFAULT_DESCRIPTION,
    },
  }

  override ngOnInit(): void {
    super.ngOnInit()
    this.connectRegulatoryApproval()
  }

  /** see the sibling approval checkbox: no barrier needed, effects flush late */
  private connectRegulatoryApproval(): void {
    const regulatoryApproval = fieldOf<boolean>(
      this.state,
      'fdaRegulatoryApproval'
    )
    if (!regulatoryApproval) return
    effect(
      () => {
        const approved: Maybe<boolean> = regulatoryApproval()
        if (approved) {
          this.props.disabled = false
          this.props.extraType = 'description'
          this.props.description = DEFAULT_DESCRIPTION
          if (this.formControl.value === undefined) {
            this.formControl.setValue(false)
          }
        } else {
          this.props.disabled = true
          this.props.description =
            'FDA Companion Test only applies when Regulatory Approval is selected'
          this.formControl.setValue(undefined)
        }
      },
      { injector: this.injector }
    )
  }
}
