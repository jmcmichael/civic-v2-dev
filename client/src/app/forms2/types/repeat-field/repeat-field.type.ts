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
  FieldType,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { filter, Observable, Subject, map } from 'rxjs'
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
  onModelChange$!: Observable<any[]> // emits all field model changes
  onValueChange$: Subject<any[]> // emits on model changes, and other model update sources (query param, or other pre-init model value)

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
    this.onValueChange$ = new Subject<any[]>()
  }

  ngAfterViewInit(): void {
    // provide Subject from which child fields emit onTagClose events
    // subscribe to call FieldArray.remove()
    this.props.onRemove$ = new Subject<number>()
    this.props.onRemove$.pipe(untilDestroyed(this)).subscribe((i: number) => {
      this.remove(i)
    })

    // create onModelChange$ observable from fieldChanges
    if (!this.field?.options?.fieldChanges) {
      console.error(
        `${this.field.id} field could not find fieldChanges Observable`
      )
    } else {
      // options.fieldChanges uses shallow change detection, so when
      // the model is an array, it will only emit changes when items are
      // added or removed. Therefore changes to individual elements will
      // not be emitted. Individual elements do emit their own changes, and
      // we can identify those by checking to see if their parent's field id matches
      // this repeat-field's id. Either repeat-field parent or child repeat-item
      // event are then mapped to return this repeat-field model, which
      // includes its up-to-date elements.
      this.onModelChange$ = this.field.options.fieldChanges.pipe(
        filter((c) => {
          return (
            c.field.id === this.field.id || // matches this field
            c.field.parent?.id === this.field.id // matches this field's child fields
          )
        }),
        map((_c) => this.model)
      )

      // emit value from onValueChange$ for every model change
      this.onModelChange$.pipe(
        // tag(`repeat-field ${this.field.id} onModelChange$`),
        untilDestroyed(this)
      ).subscribe((v) => {
        this.onValueChange$.next(v)
      })
    }
  }
}
