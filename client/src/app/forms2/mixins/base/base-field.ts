import { ChangeDetectorRef, Component, Injector } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'
import { Observable, Subject, filter, BehaviorSubject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

export function BaseFieldType<FC extends FieldTypeConfig, V>() {
  @UntilDestroy()
  @Component({ template: '' })
  class BaseFieldType extends FieldType<FC> {
    // SOURCE STREAMS
    // emits all field model changes
    onModelChange$!: Observable<Maybe<V>>
    // emits values for both model changes and non-model value updates
    // e.g. query param, tag close, restore saved form state
    onValueChange$!: BehaviorSubject<Maybe<V>>

    constructor() {
      super() // call abstract FieldType's constructor
    }

    configureBaseField(): void {
      //
      // set up model and value changes observables
      //
      this.onValueChange$ = new BehaviorSubject<Maybe<V>>(undefined)
      if (!this.field?.options?.fieldChanges) {
        console.error(
          `${this.field.id} could not find its fieldChanges Observable, ensure configureBaseField() is called in FieldType's AfterViewInit hook.`
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

      // this.onValueChange$
      //   .pipe(tag(`${this.field.id} field-type-base onValueChange$`))
      //   .subscribe()
    }
  }
  return BaseFieldType
}
