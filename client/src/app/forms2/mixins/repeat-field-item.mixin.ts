import { Injectable } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { MixinConstructor } from 'ts-mixin-extended'

export function RepeatFieldItem<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Injectable()
  abstract class RepeatFieldItem extends Base {
    repeatFieldId?: string
    configureRepeatFieldItem(): void {
      console.log(
        `${this.field.id} configureRepeatFieldItem()`
      )
      if (this.props.isRepeatItem) {
        if (!this.field.parent?.id) {
          console.error(
            `${this.field.id} is configured as a repeat-field item, but could not locate a parent field id.`
          )
          return
        } else if(this.field.parent.type !== 'repeat-field') {
          console.error(
            `${this.field.id} is configured as a repeat-field item, but its parent ${this.field.parent.id} is not a repeat-field type.`
          )
          return
        }
        this.repeatFieldId = this.field.parent.id
      }
    }
  }

  return RepeatFieldItem
}
