import { Component, Injector } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'

export function BaseFieldType<FC extends FieldTypeConfig>() {
  @UntilDestroy()
  @Component({ template: '' })
  class BaseFieldType extends FieldType<FC> {
    // declare injector so that mixins may inject required
    // dependencies with this.injector.get()
    // NOTE: all components using this base will need to pass injector
    // in their super() calls, e.g.
    // constructor(public injector: Injector) { super(injector) }
    constructor(public injector: Injector) {
      super()
    }
  }
  return BaseFieldType
}
