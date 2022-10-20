import { Injectable } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export function EnumTagField<E>() {
  return function EnumTagFieldConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class EnumTagFieldMixin extends Base {
      // BASE FIELD TYPE SOURCE STREAMS
      // even though they're declared here, the base-field actually instantiates them
      onValueChange$?: Subject<Maybe<string | number>>

      // SOURCE STREAMS
      onTagClose$!: Subject<MouseEvent> // emits on entity tag closed btn click

      enumOption$!: Subject<keyof E[]>

      // PRESENTATION STREAMS
      selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>

      configureEnumTagField(optionsEnum: E): void {
        if (!this.onValueChange$) {
          console.error(
            `${this.field.id} cannot find onValueChange$ Subject, ensure configureBaseField() has been called before configureDisplayStringTag in its AfterViewInit hook.`
          )
          return
        }

        this.onValueChange$
          .pipe(tag(`${this.field.id} onValueChanges$`), untilDestroyed(this))
          .subscribe((str: Maybe<string | number>) => {
            // this.tagLabel$.next(str ? str.toString() : undefined)
          })

        this.onTagClose$ = new Subject<MouseEvent>()

        this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
          this.resetField()
        })
      }
      resetField() {
        if (this.props.isMultiSelect) {
          this.formControl.setValue([])
        } else {
          this.formControl.setValue(undefined)
        }
      }
    }

    return EnumTagFieldMixin
  }
}
