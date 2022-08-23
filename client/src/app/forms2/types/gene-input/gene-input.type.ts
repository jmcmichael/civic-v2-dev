import { ChangeDetectionStrategy, Component, Type } from '@angular/core'
import { EvidenceItemStateFacade } from '@app/forms2/states/evidence-statechart/evidence-statechart.facade'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyValueChangeEvent } from '@ngx-formly/core/lib/models'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { filter, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'

interface CvcGeneInputFieldProps extends FormlyFieldProps {}

export interface CvcGeneInputFieldConfig
  extends FormlyFieldConfig<CvcGeneInputFieldProps> {
  type: 'gene-input' | Type<CvcGeneInputField>
}

@UntilDestroy()
@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneInputField extends FieldType<
  FieldTypeConfig<CvcGeneInputFieldProps>
> {
  state: Maybe<EvidenceState>
  geneId$: Maybe<Subject<Maybe<number>>>

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
          if (this.state && this.state.fields.geneId$) {
            this.geneId$ = this.state.fields.geneId$
            if (this.geneId$ && field.options?.fieldChanges) {
              field.options.fieldChanges
                .pipe(
                  filter((c) => c.field.key === field.key),
                  tag('gene-input fields.geneId$'),
                  untilDestroyed(this)
                )
                .subscribe((change) => {
                  this.geneId$!.next(change.value)
                })
            }
          }
        }
      },
    },
  }
}
