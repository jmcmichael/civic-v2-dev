import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { EvidenceItemStateFacade } from '@app/forms2/states/evidence-statechart/evidence-statechart.facade'
import { Maybe } from '@app/generated/civic.apollo'
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyValueChangeEvent } from '@ngx-formly/core/lib/models'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { Observable, Subject, Subscribable, Subscription } from 'rxjs'

interface CvcGeneInputFieldProps extends FormlyFieldProps {}

export interface CvcGeneInputFieldConfig
  extends FormlyFieldConfig<CvcGeneInputFieldProps> {
  type: 'gene-input' | Type<CvcGeneInputField>
}

@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField extends FieldType<
  FieldTypeConfig<CvcGeneInputFieldProps>
> {
  state?: EvidenceItemStateFacade
  changeSub?: Subscription

  constructor() {
    super()
  }

  defaultOptions: Partial<FieldTypeConfig<CvcGeneInputFieldProps>> = {
    props: {
      label: 'Gene',
    },
    hooks: {
      onInit: (field) => {
        if (field?.options?.formState) {
          this.state = field.options.formState
        }
        if (this.state && field?.options?.fieldChanges) {
          this.changeSub = field.options.fieldChanges.subscribe((change) => {
            if(this.state) this.state.send('SET_GENE', change.value)
          })
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
