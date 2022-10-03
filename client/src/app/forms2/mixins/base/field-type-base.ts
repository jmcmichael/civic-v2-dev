import { Component, Injector } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'
import { Observable, Subject, filter } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'

export function BaseFieldType<FC extends FieldTypeConfig, V>() {
  @UntilDestroy()
  @Component({ template: '' })
  class BaseFieldType extends FieldType<FC> {
    // SOURCE STREAMS
    // emits all field model changes
    onModelChange$!: Observable<Maybe<V>>
    // emits values for both model changes and non-model value updates
    // e.g. query param, tag close, restore saved form state
    onValueChange$!: Subject<Maybe<V>>

    // Mixins cannot define a constructor, so mixin base components
    // provide the ng injector that mixins may inject any required
    // dependencies with this.injector.get().
    // NOTE: all components using this base will need to pass the
    // injector with their super() calls, e.g.
    // constructor(public injector: Injector) { super(injector) }
    constructor(public injector: Injector) {
      super() // call abstract FieldType's constructor
    }

    configureBaseField(): void {
      //
      // set up model and value changes observables
      //
      this.onValueChange$ = new Subject<Maybe<V>>()
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

    }
  }
  return BaseFieldType
}
