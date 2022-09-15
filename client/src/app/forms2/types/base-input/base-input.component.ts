import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { ValueChanges } from '@app/forms2/mixins/value-changes.mixin'
import { RepeatFieldItem } from '@app/forms2/mixins/repeat-field-item.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

export interface CvcBaseInputFieldProps extends FormlyFieldProps {
  isRepeatItem: boolean
}

export interface CvcBaseInputFieldConfig
  extends FormlyFieldConfig<CvcBaseInputFieldProps> {
  type: 'base-input' | 'base-input-item' | Type<CvcBaseInputField>
}

const BaseInputMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcBaseInputFieldProps>>(),
  ValueChanges<Maybe<string | number>>(),
  RepeatFieldItem
)

@UntilDestroy()
@Component({
  selector: 'cvc-base-input',
  templateUrl: './base-input.component.html',
  styleUrls: ['./base-input.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcBaseInputField extends BaseInputMixin implements AfterViewInit {
  // SOURCE STREAMS
  onTagClose$: Subject<MouseEvent> // emits on entity tag closed btn click

  // PRESENTATION STREAMS
  tagLabel$: Subject<Maybe<string>> // emits label for tag

  defaultOptions: Partial<FieldTypeConfig<CvcBaseInputFieldProps>> = {
    modelOptions: {
      updateOn: 'blur', // update model when focus leaves field (see enter keydown.enter EventEmitter in template)
    },
    props: {
      label: 'Enter value',
      isRepeatItem: false,
    },
  }

  repeatFieldId?: string

  constructor(public injector: Injector) {
    super(injector)
    this.onTagClose$ = new Subject<MouseEvent>()
    this.tagLabel$ = new Subject<Maybe<string>>()
  }

  ngAfterViewInit(): void {
    this.configureValueChanges()
    this.configureRepeatFieldItem()

    this.onValueChange$.subscribe((str: Maybe<string | number>) => {
      this.tagLabel$.next(str ? str.toString() : undefined)
    })

    // if this is a repeat-item field, emit onRemove$ event on tag close,
    // otherwise, just reset field locally
    if (this.props.isRepeatItem) {
      // check if parent field is of 'repeat-field' type
      if (!(this.field.parent && this.field.parent?.type === 'repeat-field')) {
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
  } // ngAfterViewInit

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
