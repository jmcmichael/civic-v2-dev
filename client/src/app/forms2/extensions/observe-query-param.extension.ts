import { FormControl } from '@angular/forms'
import { ActivatedRoute, Params } from '@angular/router'
import { Maybe } from '@app/generated/civic.apollo'
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core'
import { distinctUntilKeyChanged, Subscription } from 'rxjs'

export interface ObserveQueryParamProps {
  // boolean toggles observation
  // provide string to specify query param (field.key is default)
  paramKey: boolean | string
  _routeSub: Subscription
}

export const defaultObserveQueryParamProps = {
  paramKey: true,
}

export class ObserveQueryParamExtension implements FormlyExtension {
  paramKey: Maybe<string | number>
  fieldParam: Maybe<string | number>

  constructor(private route: ActivatedRoute) {}
  postPopulate(field: FormlyFieldConfig) {
    // only primitive values will be observed, so we skip
    // observing params for fieldGroups, fieldArrays
    // NOTE: it is possible to support array, object types, just want
    // to keep things simple to start
    if (field.fieldGroup || field.fieldArray) return

    // merge field props, end if field config has has paramKey set to false
    const props = field.props || { ...defaultObserveQueryParamProps }
    if (props.paramKey === false) return

    this.paramKey = this.getParamKey(field)
    if (!this.paramKey) return

    // subscribe to route queryParams
    props._routeSub = this.getRouteSub(this.route, field)

    // unsub from routeSub onDestroy
    field.hooks = {
      onDestroy: (field) => {
        if (field.props?._routeSub) field.props._routeSub.unsubscribe()
      },
    }
  }

  getParamKey(field: FormlyFieldConfig): Maybe<string | number> {
    const props = field!.props!
    // get queryParam from props, or use field's key if it is a string
    if (typeof props.paramKey === 'string') {
      return props.paramKey
    } else if (field.key) {
      if (typeof field.key === 'string') {
        return field.key
      } else {
        console.warn(
          `observe-query-param cannot use field key ${JSON.stringify(
            field.key
          )} of type ${typeof field.key} to observe a query param. Use prop.paramKey to specify a query param.`
        )
        return
      }
    }
    return
  }

  getRouteSub(route: ActivatedRoute, field: FormlyFieldConfig): Subscription {
    const sub = route.queryParams
      .pipe(distinctUntilKeyChanged(this.paramKey!))
      .subscribe((params: Params) => {
        // getRouteSub isn't called unless fieldGroup, fieldArray check passed
        // this field's control is a FormControl
        const ctrl = field.formControl as FormControl
        // set param value, end if undefined
        const paramValue = params[this.paramKey!]
        if (!paramValue) {
          sub.unsubscribe()
          return
        }

        // parse param
        let fieldValue: Maybe<number | string | boolean> = undefined
        try {
          fieldValue = JSON.parse(paramValue)
        } catch (error) {
          console.warn(
            `observe-query-param failed to parse query param ${this.paramKey}: ${error}`
          )
          sub.unsubscribe()
          return
        }

        // ensure provided value is not an object, end if it is
        if (typeof fieldValue === 'object') {
          console.warn(
            `observe-query-param may only set primitive types, param ${
              this.paramKey
            } is an object: ${JSON.stringify(fieldValue)}`
          )
          sub.unsubscribe()
          return
        }
        ctrl.setValue(fieldValue)
      })

    return sub
  }
}
