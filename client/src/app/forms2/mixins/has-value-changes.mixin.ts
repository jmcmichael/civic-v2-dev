import { Injectable } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { FieldType } from '@ngx-formly/core'
import { filter, Observable } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export function HasValueChanges<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Injectable()
  abstract class HasValueChanges extends Base {
    // SOURCE STREAMS
    mOnModelChange$!: Observable<Maybe<any>> // emits all field model changes

    configureValueChanges(): void {
      console.log(`${this.field.id} configureValueChanges()`)
      if (!this.field?.options?.fieldChanges) {
        console.error(
          `${this.field.type} field ${this.field.id} could not find its fieldChanges Observable.`
        )
        return
      }

      this.mOnModelChange$ = this.field.options.fieldChanges.pipe(
        filter((c) => c.field.id === this.field.id), // filter out other fields
        pluck('value')
      )

      this.mOnModelChange$
        .pipe(tag(`${this.field.type}: ${this.field.id} onModelChange$`))
        .subscribe()

      //   // emit value from onValueChange$ for every model change
      //   this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
      //     this.onValueChange$.next(v)
      //   })

      //   this.onValueChange$.subscribe((str: Maybe<string | number>) => {
      //     this.tagLabel$.next(str ? str.toString() : undefined)
      //   })
    }

  }

  return HasValueChanges
}
