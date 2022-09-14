import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { HasValueChanges } from '@app/forms2/mixins/has-value-changes.mixin'
import { RepeatFieldItem } from '@app/forms2/mixins/repeat-field-item.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { FormlyValueChangeEvent } from '@ngx-formly/core/lib/models'
import { filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
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
  HasValueChanges,
  RepeatFieldItem,
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
  onModelChange$!: Observable<Maybe<string | number>> // emits all field model changes
  onValueChange$: Subject<Maybe<string | number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)
  onTagClose$: Subject<MouseEvent> // emits on entity tag closed btn click

  // PRESENTATION STREAMS
  tagLabel$: Subject<Maybe<string>> // emits label for tag

  defaultOptions: Partial<FieldTypeConfig<CvcBaseInputFieldProps>> = {
    modelOptions: {
      updateOn: 'blur',
    },
    props: {
      label: 'Enter value',
      isRepeatItem: false,
    },
  }

  repeatFieldId?: string

  constructor(public injector: Injector) {
    super(injector)
    this.onValueChange$ = new Subject<Maybe<string | number>>()
    this.onTagClose$ = new Subject<MouseEvent>()
    this.tagLabel$ = new Subject<Maybe<string>>()
  }

  getChangesFilter = () => {
    if (!this.props.isRepeatItem) {
      return (c: FormlyValueChangeEvent) => c.field.id === this.field.id
    } else {
      return (c: FormlyValueChangeEvent) =>
        c.field.id === this.field.id &&
        c.field.parent?.id === this.repeatFieldId
    }
  }

  ngAfterViewInit(): void {
    this.configureValueChanges()
    this.configureRepeatFieldItem()

    // if this is a repeat-field item, store parent repeat-field key
    // to use in field changes filter
    if (this.props.isRepeatItem) {
      if (!this.field.parent?.id) {
        console.error(
          `base-input field ${this.field.id} is configured as a repeat-field item, but could not locate a parent field id.`
        )
      } else {
        this.repeatFieldId = this.field.parent.id
      }
    }

    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `base-input field ${this.field.id} could not find its fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter((c) => c.field.id === this.field.id), // filter out other fields
        // tag(`${this.field.id} onModelChange$`),
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        this.onValueChange$.next(v)
      })

      this.onValueChange$.subscribe((str: Maybe<string | number>) => {
        this.tagLabel$.next(str ? str.toString() : undefined)
      })
    }

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
