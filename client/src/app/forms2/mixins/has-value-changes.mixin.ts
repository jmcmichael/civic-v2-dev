import { Injectable } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export function HasValueChanges<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Injectable()
  abstract class HasValueChanges extends Base {
    // SOURCE STREAMS
    onModelChange$!: Observable<Maybe<any>> // emits all field model changes
    onValueChange$ = new Subject<Maybe<any>>()

    configureValueChanges(): void {
      // console.log(`${this.field.id} configureValueChanges()`)
      if (!this.field?.options?.fieldChanges) {
        console.error(
          `${this.field.type} field ${this.field.id} could not find its fieldChanges Observable.`
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

  return HasValueChanges
}
