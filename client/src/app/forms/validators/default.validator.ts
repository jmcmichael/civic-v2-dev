import { AbstractControl, ValidationErrors } from '@angular/forms'
import { FormlyFieldConfig } from '@ngx-formly/core'
import {
  CvcValidationKey,
  fieldMessage,
  genericRequired,
} from '@app/forms/messages/field-messages'

/**
 * The global validator vocabulary. Each entry asks the field-message catalog
 * first, so a field can speak for itself, and falls back to a sentence that
 * at least names the field. Everything formly ranks above the global catalog
 * — an error payload's own `message`, `validation.messages`, a validator's
 * inline `message` — still wins.
 */
function catalogued(
  key: CvcValidationKey,
  fallback: (ffc: FormlyFieldConfig) => string
) {
  return {
    name: key,
    message: (_err: any, ffc: FormlyFieldConfig): string =>
      fieldMessage(ffc, key) ?? fallback(ffc),
  }
}

export const defaultMessages = [
  catalogued('required', genericRequired),
  catalogued(
    'minLength',
    (ffc) => `This field has a minimum length of ${ffc.props?.minLength}.`
  ),
  catalogued(
    'maxLength',
    (ffc) => `This field has a maximum length of ${ffc.props?.maxLength}.`
  ),
  catalogued(
    'min',
    (ffc) => `This field has a minimum value of ${ffc.props?.min}.`
  ),
  catalogued(
    'max',
    (ffc) => `This field has a maximum value of ${ffc.props?.max}.`
  ),
  catalogued(
    'pattern',
    (ffc) => `This field's value must fit the pattern ${ffc.props?.pattern}.`
  ),
  catalogued('integer', () => 'Value must be an integer.'),
  catalogued(
    'nucleotide',
    () => 'Value must only contain A, C, T, G, and/or /.'
  ),
  catalogued('clinvar', () => 'ClinVar IDs must be integers.'),
]

export const defaultValidators = [
  {
    name: 'integer',
    validation: (
      fc: AbstractControl,
      ffc: FormlyFieldConfig
    ): ValidationErrors | null => {
      if (fc.value === '' || fc.value === undefined || fc.value === null) {
        return null
      } else {
        return /^\d+$/.test(fc.value) ? null : { integer: true }
      }
    },
  },
  {
    name: 'nucleotide',
    validation: (
      fc: AbstractControl,
      ffc: FormlyFieldConfig
    ): ValidationErrors | null => {
      if (fc.value === '' || fc.value === undefined || fc.value === null) {
        return null
      } else {
        return /^[ACTG\/]+$/.test(fc.value) ? null : { nucleotide: true }
      }
    },
  },
  {
    name: 'clinvar',
    validation: (
      fc: AbstractControl,
      ffc: FormlyFieldConfig
    ): ValidationErrors | null => {
      if (!Array.isArray(fc.value)) return null
      for (const value of fc.value) {
        if (!(value === '' || value === undefined || value === null)) {
          if (!/^\d+$/.test(value)) {
            return { clinvar: true }
          }
        }
      }
      return null
    },
  },
]
