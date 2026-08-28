import { CvcFormFieldExtraType } from '@app/forms/wrappers/form-field/form-field.wrapper'
import { CvcColWrapperProps } from '@app/forms/wrappers/grid/col.wrapper'

/** Singular/plural labels used to build placeholders and dropdown messages. */
export type CvcSelectEntityName = { singular: string; plural: string }

/** Props every entity-select field shares. */
export interface CvcEntitySelectFieldProps extends CvcColWrapperProps {
  entityName: CvcSelectEntityName
  isMultiSelect: boolean
  tooltip?: string
  extraType?: CvcFormFieldExtraType
}

/** Props every enum-select field shares. */
export interface CvcEnumSelectFieldProps extends CvcColWrapperProps {
  isMultiSelect: boolean
  tooltip?: string
  extraType?: CvcFormFieldExtraType
}

/**
 * Props for a select whose availability is gated on the form's entity type —
 * some evidence and assertion types have no associated disease, therapy or
 * code at all. See CvcTypeGatedSelectFieldBase.
 */
export interface CvcTypeGatedSelectFieldProps extends CvcEntitySelectFieldProps {
  /** the form's entity type must be chosen before this field can be used */
  requireType: boolean
  requireTypePromptFn: (entityName: string, isMultiSelect?: boolean) => string
}
