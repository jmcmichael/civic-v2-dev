import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { EvidenceItemStateFacade } from '@app/forms2/states/evidence-statechart/evidence-statechart.facade'
import { Maybe } from '@app/generated/civic.apollo'
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

@Component({
  selector: 'cvc-variant-input',
  templateUrl: './variant-input.type.html',
  styleUrls: ['./variant-input.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantInputField extends FieldType<
  FieldTypeConfig<CvcVariantInputFieldProps>
> {
  state?: EvidenceItemStateFacade
  geneId$?: Observable<Maybe<number>>
  changeSub?: Subscription

  constructor() {
    super()
  }

  defaultOptions: Partial<FieldTypeConfig<CvcVariantInputFieldProps>> = {
    props: {
      label: 'Variant',
    },
    hooks: {
      onInit: (field) => {
        if (field?.options?.formState) {
          this.state = field.options.formState
          this.geneId$ = this.state!.geneId$
          this.state!.state$.pipe(tag('state')).subscribe()
          if (field?.options?.fieldChanges) {
            this.changeSub = field.options.fieldChanges.subscribe((change) => {
              if (this.state) this.state.send('SET_VARIANT', change.value)
            })
          }
        }
      },
      onDestroy: (_) => {
        if (this.changeSub) {
          this.changeSub.unsubscribe()
        }
      },
    },
  }
}
