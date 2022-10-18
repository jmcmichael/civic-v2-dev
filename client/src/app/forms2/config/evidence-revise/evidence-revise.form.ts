import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core'
import { FormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { sourceArrayTypeOption } from '@app/forms/config/types/source-array/source-array.type'
import {
  evidenceReviseFormInitialModel,
  EvidenceReviseModel,
} from '@app/forms2/models/evidence-revise.model'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  EvidenceDetailGQL,
  EvidenceItemRevisableFieldsGQL,
  Maybe,
  RevisableEvidenceFieldsFragment,
  RevisionsGQL,
  SuggestEvidenceItemRevisionGQL,
} from '@app/generated/civic.apollo'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
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
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL.fetch({ evidenceId: this.evidenceId }).subscribe({
      next: ({ data: { evidenceItem } }) => {
        if (evidenceItem) {
          this.model = this.toFormModel(evidenceItem)
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

  toFormModel(evidence: RevisableEvidenceFieldsFragment): EvidenceReviseModel {
    return {
      id: evidence.id,
      fields: {
        ...evidence,
        geneId: 5,
        variantId: 1388,
        molecularProfileId: evidence.molecularProfile.id,
        sourceId: evidence.source.id,
        drugIds: evidence.drugs.map(d => d.id),
      }
    }
  }

  onSubmit(model?: EvidenceReviseModel) {
    console.log('------ Evidence Revise Form Submitted ------')
    console.log(model)
  }
}
