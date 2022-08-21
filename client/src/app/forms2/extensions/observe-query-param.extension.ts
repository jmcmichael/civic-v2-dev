import { FormControl } from '@angular/forms'
import { ActivatedRoute, Params } from '@angular/router'
import { Maybe } from '@app/generated/civic.apollo'
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core'
import { Subscription } from 'rxjs'

export interface ObserveQueryParamProps {
  // boolean toggles observation
  // provide string to specify query param (field.key is default)
  observeParam: boolean | string
  _routeSub: Subscription
}

export const defaultObserveQueryParamProps = {
  observeParam: true,
}

export class ObserveQueryParamExtension implements FormlyExtension {
  constructor(private route: ActivatedRoute) {}
  postPopulate(field: FormlyFieldConfig) {
    // only primitive values will be observed, so we skip
    // observing params for fieldGroups, fieldArrays
    // NOTE: it is possible to support array, object types, just want
    // to keep things simple to start
    if (field.fieldGroup || field.fieldArray) return

    // merge field props, end if field config has has observeParam set to false
    const props = field.props || { ...defaultObserveQueryParamProps }
    if (props.observeParam === false) return

    let observeParam: string | number
    // get queryParam from props, or use field's key if it is a string
    if (typeof props.observeParam === 'string') {
      observeParam = props.observeParam
    } else if (field.key) {
      if (typeof field.key === 'string') {
        observeParam = field.key
      } else {
        console.warn(
          `observe-query-param cannot use field key ${JSON.stringify(
            field.key
          )} of type ${typeof field.key} to observe a query param. Use prop.observeParam to specify a query param.`
        )
        return
      }
    }

    // subscribe to route queryParams
    props._routeSub = this.route.queryParams.subscribe((params: Params) => {
      let exitSub = () => {
        props._routeSub.unsubscribe()
      }

      // earlier fieldGroup/fieldArray check passed, so we know
      // this field's control is a FormControl
      const ctrl = field.formControl as FormControl
      // set param value, end if undefined
      const paramValue = params[observeParam]
      if (!paramValue) {
        exitSub()
        return
      }

      // parse param
      let fieldValue: Maybe<number | string | boolean> = undefined
      try {
        fieldValue = JSON.parse(paramValue)
      } catch (error) {
        console.warn(
          `observe-query-param failed to parse query param ${observeParam}: ${error}`
        )
        exitSub()
      }

      // ensure provided value is not an object, end if it is
      if (typeof fieldValue === 'object') {
        console.warn(
          `observe-query-param may only set primitive types, param ${observeParam} is an object: ${JSON.parse(
            fieldValue
          )}`
        )
        exitSub()
        return
      }
      ctrl.setValue(fieldValue)
    })

    // unsub from routeSub onDestroy
    field.hooks = {
      onDestroy: (field) => {
        if (field.props?._routeSub) field.props._routeSub.unsubscribe()
      },
    }
  }
}
