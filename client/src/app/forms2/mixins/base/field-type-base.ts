import { Component } from '@angular/core'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'

export function BaseFieldType<FC extends FieldTypeConfig>() {
  @Component({ template: '' })
  class BaseFieldType extends FieldType<FC> {}
  return BaseFieldType
}

