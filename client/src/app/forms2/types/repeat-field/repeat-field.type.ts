import {
  Component,
  AfterViewInit,
  ChangeDetectionStrategy,
  Type,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
  FieldArrayType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'

interface CvcRepeatFieldProps extends FormlyFieldProps {
  placeholder: Maybe<string>
  addLabel: string
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
  extends FieldArrayType<FieldTypeConfig<CvcRepeatFieldProps>>
  implements AfterViewInit
{
  defaultOptions: Partial<FieldTypeConfig<CvcRepeatFieldProps>> = {
    props: {
      label: 'LABEL',
      placeholder: 'PLACEHOLDER',
      addLabel: ''
    },
  }
  constructor() {
    super()
  }

  ngAfterViewInit(): void {}
}
