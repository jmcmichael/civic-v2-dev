import { ChangeDetectorRef, Component, Injector } from '@angular/core'
import { EntityState } from '@app/forms2/states/entity.state'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'
import { Observable, Subject, filter, BehaviorSubject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

export type BaseFieldValue = Maybe<
  number | string | boolean | string[] | number[]
>

export function BaseFieldType<
  FC extends FieldTypeConfig,
  V extends BaseFieldValue
>() {
  @UntilDestroy()
  @Component({ template: '' })
  class BaseFieldType extends FieldType<FC> {
    state?: EntityState

    // SOURCE STREAMS
    // emits all field model changes
    onModelChange$!: Observable<Maybe<V>>
    // emits values for both model changes and non-model value updates
    // e.g. query param, tag close, restore saved form state
    onValueChange$!: BehaviorSubject<Maybe<V>>

    // STATE OUTPUT STREAM
    stateValueChange$?: BehaviorSubject<Maybe<V>>

    initialLabel?: string

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

      if (this.field.options?.formState) {
        this.state = this.field.options.formState
        this.autoConfigureStateValueChanges()
      }
    }

    autoConfigureStateValueChanges(): void {
      if (!this.field.key && typeof this.field.key === 'string') {
        console.warn(
          `${this.field.id} cannot auto-configure state value changes, field key must be a string. field.key: `,
          this.field.key
        )
      }
      const stateField = `${this.field.key}$`
      if (this.state && this.state.fields[stateField]) {
        this.stateValueChange$ = this.state.fields[stateField]
        this.onValueChange$.pipe(untilDestroyed(this)).subscribe((v) => {
          if (this.stateValueChange$) this.stateValueChange$.next(v)
        })
        // update state if field has been prepopulated w/ query param or preset model
        if (this.formControl.value) {
          this.stateValueChange$.next(this.formControl.value)
        }
      }
    }
    configureLabels(): void {
      if (typeof this.field.type !== 'string') return
      if (this.field.type.includes('multi')) {
        this.initialLabel = this.field.props.multiLabel
      } else {
        this.initialLabel = this.field.props.label
      }
      // watch value changes to update label
      if (!this.onValueChange$) return
      this.onValueChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        if (typeof this.field.type !== 'string') return
        if (v === undefined || v === null) {
          if (this.field.type.includes('multi')) {
            this.props.label = this.props.multiLabel
          } else {
            this.props.label = this.initialLabel
          }
          return
        }
        // is a singular value, set to singular label
        // (assuming initial is singular)
        if (
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean'
        ) {
          this.props.label = this.initialLabel
          return
        }
        // is array, set plural or singular depending on length
        if (v.length > 1) {
          this.props.label = this.props.pluralLabel
        } else if (v.length === 1) {
          this.props.label = this.props.entityName.singular
        } else {
          this.props.label = this.initialLabel
        }
      })
    }
  }
  return BaseFieldType
}
