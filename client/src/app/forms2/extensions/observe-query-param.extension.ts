import { FormControl } from '@angular/forms'
import { ActivatedRoute, Params } from '@angular/router'
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core'

export interface ObserveQueryParamProps {
  observeParam: boolean | string
}

export const defaultObserveQueryParamProps = {
  observeParam: true,
}

export class ObserveQueryParamExtension implements FormlyExtension {
  constructor(private route: ActivatedRoute) {}
  postPopulate(field: FormlyFieldConfig) {
    // only primitive values will be observed, no objects or arrays
    if (field.fieldGroup || field.fieldArray) return
    const props = field.props || { ...defaultObserveQueryParamProps }
    if (props.observeParam === false) return
    // get queryParam from props, or use field's key by default
    const observeParam: string = props.queryParam || field.key
    // no param specified, no key, exit
    if (!observeParam) return

    this.route.queryParams.subscribe((params: Params) => {
      // no fieldGroups or Arrays, so field is a formControl
      const ctrl = field.formControl as FormControl
      const value = params[observeParam]
      if (value) console.log(`field ${field.key} query param ${observeParam}: ${value}`)
      else console.log(`field ${field.key} did not find query param ${observeParam}`)
      if (value) ctrl.setValue(value)
    })
  }
}

export function registerObserveQueryParamExtension(route: ActivatedRoute) {
  return {
    extensions: [
      {
        name: 'observe-query-param',
        extension: new ObserveQueryParamExtension(route),
      },
    ],
  };
}
