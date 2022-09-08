import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Type,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldArrayType,
  FieldArrayTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'

interface CvcRepeatFieldProps extends FormlyFieldProps {
  placeholder?: string
  addLabel: string
  orientation?: 'horizontal' | 'vertical'
  minWidth?: number
  maxWidth?: number

  // Subject to handle tag remove events from child '-item' fields
  onRemove$: Subject<number>
}

export interface CvcRepeatFieldConfig
  extends FormlyFieldConfig<CvcRepeatFieldProps> {
  type: 'repeat-field' | Type<CvcRepeatField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-repeat-field',
  templateUrl: './repeat-field.type.html',
  styleUrls: ['./repeat-field.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcRepeatField
  extends FieldArrayType<FieldArrayTypeConfig<CvcRepeatFieldProps>>
  implements AfterViewInit
{
  // SOURCE STREAMS
  onModelChange$!: Observable<Maybe<number>> // emits all field model changes
  onValueChange$: Subject<Maybe<number>> // emits on model changes, and other model update sources (query param, or other pre-init model value)

  itemFieldType: Maybe<string>

  // field default options
  defaultOptions: Partial<FieldArrayTypeConfig<CvcRepeatFieldProps>> = {
    defaultValue: [],
    props: {
      label: 'LABEL',
      placeholder: 'PLACEHOLDER',
      addLabel: 'ADD',
      orientation: 'horizontal',
      onRemove$: new Subject<number>(),
    },
  }
  constructor() {
    super()
    this.onValueChange$ = new Subject<Maybe<number>>()
  }

  ngAfterViewInit(): void {
    this.props.onRemove$ = new Subject<number>()
    this.props.onRemove$.pipe(untilDestroyed(this)).subscribe((i: number) => {
      this.remove(i)
    })
    // create observables for model updates, one for repeat-field model updates
    // and another for fieldArray item model updates
    if (!this.field?.fieldArray) {
      console.error(
        `${this.field.key} repeat-field could not find fieldArray config.`
      )
      return
    }
    const fieldArray = this.field.fieldArray as FormlyFieldConfig
    if (!fieldArray.type) {
      console.error(
        `${this.field.key} repeat-field could not find fieldArray config type.`
      )
      return
    } else {
      // typeof fArray.type === 'string') {
      // this.itemFieldType = fArray.type
    }

    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.key} field could not find fieldChanges Observable`
      )
    } else {
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter((f) => {
          console.log(f)
          return true
        }),
        tag('repeat-field onModelChange$'),
        pluck('value')
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        // console.log('repeat-field onModelChange$: ', v)
        this.onValueChange$.next(v)
      })
    }
  }
}
