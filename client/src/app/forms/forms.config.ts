import { ConfigOption } from '@ngx-formly/core';
import { defaultMessages, defaultValidators } from './config/validators/default.validators';

export const CvcFormlyConfig: ConfigOption = {
  extras: { immutable: true },
  validationMessages: defaultMessages,
  validators: defaultValidators,
}
