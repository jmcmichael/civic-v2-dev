import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core'

type MessageValue = string | ((error: any, field: FormlyFieldConfig) => unknown)

/**
 * The sentence formly would render for a field's error, available to anything
 * that reports form state outside the field itself.
 *
 * `FormlyValidationMessage.errorMessage` resolves this internally and does not
 * export it (ngx-formly#2682), so this is the one copy of its precedence walk:
 * global catalog < error-payload `.message` < `validation.messages[key]` <
 * `validators[key].message` < `asyncValidators[key].message`. Its spec pins
 * the copy to what formly actually renders, so the two cannot drift.
 *
 * Like formly, it reports one error — the first the control carries — and
 * reports nothing for a `{ errorPath }` payload, which formly forwards to a
 * child field rather than rendering.
 */
export function resolveFieldMessage(
  field: FormlyFieldConfig,
  config: FormlyConfig,
  errorKey?: string
): string | undefined {
  const errors = field.formControl?.errors
  if (!errors) return undefined
  const key = errorKey ?? Object.keys(errors)[0]
  if (key === undefined || errors[key] === undefined) return undefined

  const payload = errors[key]
  let message: MessageValue | undefined = config.messages[key]
  if (payload !== null && typeof payload === 'object') {
    if ('errorPath' in payload) return undefined
    if ('message' in payload) message = payload.message
  }
  const validators = field.validators as Record<string, any> | undefined
  const asyncValidators = field.asyncValidators as
    Record<string, any> | undefined
  if (field.validation?.messages?.[key]) {
    message = field.validation.messages[key] as MessageValue
  }
  if (validators?.[key]?.message) message = validators[key].message
  if (asyncValidators?.[key]?.message) message = asyncValidators[key].message

  const resolved =
    typeof message === 'function' ? message(payload, field) : message
  // an Observable message (formly supports one, nothing here uses one) has no
  // synchronous answer to give
  return typeof resolved === 'string' ? resolved : undefined
}
