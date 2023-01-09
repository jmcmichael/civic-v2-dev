import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core'
import { FormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { EvidenceReviseModel } from '@app/forms2/models/evidence-revise.model'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import evidenceToModelFields from '@app/forms2/utilities/evidence-to-model-fields'
import {
  EvidenceDetailGQL,
  EvidenceItemRevisableFieldsGQL,
  RevisionsGQL,
  SuggestEvidenceItemRevisionGQL,
} from '@app/generated/civic.apollo'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { evidenceReviseFields } from './evidence-revise.form.config'

@Component({
  selector: 'cvc-evidence-revise-form',
  templateUrl: './evidence-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEvidenceReviseForm implements AfterViewInit {
  @Input() evidenceId!: number
  model$: BehaviorSubject<EvidenceReviseModel>
  model?: EvidenceReviseModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  formLayout: NzFormLayoutType
  constructor(
    private suggestRevisionGQL: SuggestEvidenceItemRevisionGQL,
    private networkErrorService: NetworkErrorsService,
    private revisableFieldsGQL: EvidenceItemRevisableFieldsGQL,
    private evidenceDetailGQL: EvidenceDetailGQL,
    private revisionsGQL: RevisionsGQL,
    private cdr: ChangeDetectorRef
  ) {
    this.model$ = new BehaviorSubject<EvidenceReviseModel>({ fields: {} })
    this.fields = evidenceReviseFields
    this.options = { formState: new EvidenceState() }
    this.formLayout = 'horizontal'
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL.fetch({ evidenceId: this.evidenceId }).subscribe({
      next: ({ data: { evidenceItem } }) => {
        if (evidenceItem) {
          this.model = {
            id: evidenceItem.id,
            fields: evidenceToModelFields(evidenceItem),
          }
          // TODO: figure out if model can be assigned w/o detectChanges() here,
          // like with a model$ BehaviorSubject?
          this.cdr.detectChanges()
        }
      },
      error: (error) => {
        console.error('Error retrieving evidenceItem.')
        console.error(error)
      },
      complete: () => {
        console.log('evidence item retrieved.')
      },
    })
  }

  onSubmit(model?: EvidenceReviseModel) {
    console.log('------ Evidence Revise Form Submitted ------')
    console.log(model)
  }
}
