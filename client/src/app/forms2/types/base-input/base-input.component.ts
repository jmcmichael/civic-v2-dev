import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Type,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { FormlyValueChangeEvent } from '@ngx-formly/core/lib/models'
import { filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

export interface CvcBaseInputFieldProps extends FormlyFieldProps {
  isRepeatItem: boolean
}

export interface CvcBaseInputFieldConfig
  extends FormlyFieldConfig<CvcBaseInputFieldProps> {
  type: 'base-input' | 'base-input-item' | Type<CvcBaseInputField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-base-input',
  templateUrl: './base-input.component.html',
  styleUrls: ['./base-input.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcBaseInputField
  extends FieldType<FieldTypeConfig<CvcBaseInputFieldProps>>
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<string | number>> // emits all field model changes
  onValueChange$: Subject<Maybe<string | number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)

  defaultOptions: Partial<FieldTypeConfig<CvcBaseInputFieldProps>> = {
    modelOptions: {
      updateOn: 'blur',
    },
    props: {
      label: 'Enter value',
      isRepeatItem: false,
    },
  }

  repeatFieldKey?: string

  constructor() {
    super()
    this.onValueChange$ = new Subject<Maybe<string | number>>()
  }

  getChangesFilter = () => {
    if (!this.props.isRepeatItem) {
      return (c: FormlyValueChangeEvent) => c.field.key === this.field.key
    } else {
      return (c: FormlyValueChangeEvent) => c.field.key === this.field.key
      && c.field.parent?.key === this.repeatFieldKey
    }
  }

  ngAfterViewInit(): void {
    // if this is a repeat-field item, store parent repeat-field key
    // to use in field changes filter
    if (this.props.isRepeatItem) {
      if (!this.field.parent?.key) {
        console.error(
          `base-input field is configured as a repeat-field item, but could not locate a parent key.`
        )
      } else {
        if (!(typeof this.field.parent.key === 'string')) {
          console.error(
            `base-input field's parent repeat-field must use a string key. Key provided: ${JSON.stringify(
              this.field.parent.key
            )}`
          )
        } else {
          this.repeatFieldKey = this.field.parent.key
        }
      }
    }
    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `base-input field ${this.field.key} could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter(this.getChangesFilter()), // filter out other fields
        tag('base-input onModelChange$'),
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        this.onValueChange$.next(v)
      })
    }
  }
}
