import { Injectable } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export function ValueChanges<V>() {
  return function ValueChangesMixin<TBase extends MixinConstructor<FieldType>>(
    Base: TBase
  ) {
    @Injectable()
    abstract class ValueChangesMixin extends Base {
      // emits all field model changes
      onModelChange$!: Observable<Maybe<V>>
      // emits values for model changes, and non-model value updates e.g. query param, tag close
      onValueChange$ = new Subject<Maybe<V>>()

      // must be called from AfterViewInit hook when field and field.options available
      configureValueChanges(): void {
        // console.log(`${this.field.id} configureValueChanges()`)
        if (!this.field?.options?.fieldChanges) {
          console.error(
            `${this.field.id} could not find its fieldChanges Observable, ensure it is called in AfterViewInit hook.`
          )
          return
        }

        this.onModelChange$ = this.field.options.fieldChanges.pipe(
          filter((c) => c.field.id === this.field.id), // filter out other fields
          pluck('value')
        )

        // emit value from onValueChange$ for every model change
        this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
          this.onValueChange$.next(v)
        })
      }
    }
    return ValueChangesMixin
  }
}
