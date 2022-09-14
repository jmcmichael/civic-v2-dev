import { ActivatedRoute } from '@angular/router'
import { ExtensionOption } from '@ngx-formly/core/lib/models'
import { ConfigureValueChangesExtension } from './configure-value-changes.extension'
import { ObserveQueryParamExtension } from './observe-query-param.extension'

export function registerCvcExtensions(route: ActivatedRoute) {
  return {
    extensions: [
      {
        name: 'observeQueryParam',
        extension: new ObserveQueryParamExtension(route),
      },
      {
        name: 'configureValueChanges',
        extension: new ConfigureValueChangesExtension()
      }
    ] as ExtensionOption[],
  }
}
