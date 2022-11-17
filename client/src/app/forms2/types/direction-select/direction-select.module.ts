import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'
import { CvcAttributeTagModule } from '@app/forms2/components/attribute-tag/attribute-tag.module'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { CvcFormFieldWrapperModule } from '@app/forms2/wrappers/form-field/form-field.module'
import {
  EvidenceDirection,
  EvidenceType,
  Maybe,
  ValidationErrors,
} from '@app/generated/civic.apollo'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import {
  FormlyFieldConfig,
  TypeOption,
  ValidatorOption,
} from '@ngx-formly/core/lib/models'
import {
  CvcDirectionSelectField,
  CvcDirectionSelectFieldConfig,
} from './direction-select.type'

const typeConfig: ConfigOption = {
  types: [
    <TypeOption>{
      name: 'direction-select',
      wrappers: ['form-field'],
      component: CvcDirectionSelectField,
      // validators: [{ name: 'direction', validation: directionValidator }],
      // validationMessages: [{ name: 'direction', message: directionValidatorMessage }]
    },
  ],
}

@NgModule({
  declarations: [CvcDirectionSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    CvcFormFieldWrapperModule, // for form-field wrapper
    CvcEnumSelectModule,
    CvcAttributeTagModule,
  ],
  exports: [CvcDirectionSelectField],
})
export class CvcDirectionSelectModule {}

// export function directionValidator(
//   ctrl: AbstractControl,
//   field: FormlyFieldConfig<CvcDirectionSelectFieldConfig>
// ): ValidationErrors | null {
//   return !ctrl.value || /(\d{1,3}\.){3}\d{1,3}/.test(ctrl.value)
//     ? null
//     : { ip: true }
// }

// export function directionValidatorMessage(
//   error: any,
//   field: FormlyFieldConfig
// ) {
//   return `"${field.formControl.value}" is not a valid IP Address`
// }

// export const edOptionValidator: ValidatorOption = {
//   name: 'ed-option',
//   validation: (
//     c: AbstractControl,
//     ffc: FormlyFieldConfig,
//     opt: any
//   ): ValidationErrors | null => {
//     const st: EvidenceState = ffc.options?.formState
//     const ed: EvidenceDirection = c.value
//     if (!ed || !st) {
//       return null
//     }
//     const et: Maybe<EvidenceType> = st.fields.evidenceType$.getValue()
//     if (!et) {
//       return null
//     } else {
//       return st.isValidDirectionOption(et, ed) ? null : { 'ed-option': et }
//     }
//   },
// }

// export const edOptionValidationMessage: ValidationMessageOption = {
//   name: 'ed-option',
//   message: (et: EvidenceType, f: FormlyFieldConfig): string => {
//     return `'${formatEvidenceEnum(
//       f.formControl?.value
//     )}' is not a valid Clinical Significance for ${formatEvidenceEnum(
//       et
//     )} Evidence.`
//   },
// }
