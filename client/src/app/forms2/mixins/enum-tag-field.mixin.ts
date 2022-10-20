import { Injectable } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { MixinConstructor } from 'ts-mixin-extended'

export function StringTagField<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Injectable()
  abstract class StringTagFieldMixin extends Base {
    // BASE FIELD TYPE SOURCE STREAMS
    // need to declare them to reference them here, then base-field creates these
    onValueChange$?: Subject<Maybe<string | number>>

    // LOCAL SOURCE STREAMS
    onTagClose$!: Subject<MouseEvent> // emits on entity tag closed btn click

    // LOCAL PRESENTATION STREAMS
    tagLabel$!: Subject<Maybe<string>> // emits label for tag

    configureStringTagField(): void {
      if (!this.onValueChange$) {
        console.error(
          `${this.field.id} cannot find onValueChange$ Subject, ensure configureBaseField() has been called before configureDisplayStringTag in its AfterViewInit hook.`
        )
        return
      }

      this.tagLabel$ = new Subject<Maybe<string>>()
      this.onValueChange$
        .pipe(tag(`${this.field.id} onValueChanges$`), untilDestroyed(this))
        .subscribe((str: Maybe<string | number>) => {
          this.tagLabel$.next(str ? str.toString() : undefined)
        })

      this.onTagClose$ = new Subject<MouseEvent>()

      if (this.props.isRepeatItem) {
        // check if parent field is of 'repeat-field' type
        if (
          !(this.field.parent && this.field.parent?.type === 'repeat-field')
        ) {
          console.error(
            `${this.field.id} does not appear to have a parent type of 'repeat-field'.`
          )
        } else {
          // check if parent repeat-field attached the onRemove$ Subject
          if (!this.field.parent?.props?.onRemove$) {
            console.error(
              `${this.field.id} cannot find reference to parent repeat-field onRemove$.`
            )
          } else {
            const onRemove$: Subject<number> = this.field.parent.props.onRemove$
            this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
              this.resetField()
              onRemove$.next(Number(this.key))
            })
          }
        }
      } else {
        this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
          this.resetField()
        })
      }
    }
    unsetModel() {
      this.formControl.setValue(undefined)
    }

    deleteTag() {
      this.tagLabel$.next(undefined)
    }

    resetField() {
      this.unsetModel()
      this.deleteTag()
    }
  }

  return StringTagFieldMixin
}
