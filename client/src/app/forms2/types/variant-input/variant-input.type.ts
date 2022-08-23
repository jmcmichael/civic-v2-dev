import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { Observable, Subscription } from 'rxjs'
import { tag } from 'rxjs-spy/operators'

interface CvcVariantInputFieldProps extends FormlyFieldProps {}

export interface CvcVariantInputFieldConfig
  extends FormlyFieldConfig<CvcVariantInputFieldProps> {
  // type: 'variant-input' | Type<CvcVariantInputField>;
}
@UntilDestroy()
@Component({
  selector: 'cvc-variant-input',
  templateUrl: './variant-input.type.html',
  styleUrls: ['./variant-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantInputField extends FieldType<
  FieldTypeConfig<CvcVariantInputFieldProps>
> {
  state?: EvidenceState
  geneId$?: Observable<Maybe<number>>

  constructor() {
    super()
  }

  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant',
    },
    hooks: {
      onInit: (field) => {
        if (field.options?.formState) {
          this.state = field.options.formState
          if (this.state && this.state.fields.geneId$) {
            this.geneId$ = this.state.fields.geneId$
            this.geneId$
              .pipe(tag('variant-input fields.geneId$'), untilDestroyed(this))
              .subscribe()
          }
        }
      },
    },
  }
}
