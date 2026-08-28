import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import {
  FormMutationService,
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import {
  ModerateAssertionGQL,
  ModerateEvidenceItemGQL,
} from '@app/components/shared/revert-entity-button/revert-entity-button.gql.generated'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  EvidenceStatus,
  Maybe,
  Organization,
} from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { NzModalService } from 'ng-zorro-antd/modal'
import { Observable } from 'rxjs'
import { pluck } from 'rxjs-etc/dist/esm/operators'

@UntilDestroy()
@Component({
  selector: 'cvc-moderate-entity-buttons',
  templateUrl: './moderate-entity-buttons.component.html',
  styleUrls: ['./moderate-entity-buttons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcModerateEntityButtonsComponent implements OnInit {
  @Input() entityType!: 'EvidenceItem' | 'Assertion'
  @Input() entityId!: number

  @Output() onModerated = new EventEmitter<EvidenceStatus | string[]>()

  @ViewChild('confirmModal') modalContents!: TemplateRef<any>

  confirmationComment?: string
  entityTypeDisplay!: string

  evidenceStatuses = EvidenceStatus

  submitState?: FormMutationState
  showConfirm = false

  mostRecentOrg: Maybe<ViewerOrganizationFragment>
  viewer$: Observable<Viewer>
  constructor(
    private revertEvidenceGQL: ModerateEvidenceItemGQL,
    private revertAssertionGQL: ModerateAssertionGQL,
    private formMutation: FormMutationService,
    private viewerService: ViewerService,
    private modal: NzModalService
  ) {
    this.viewer$ = this.viewerService.viewer$
  }

  ngOnInit() {
    if (this.entityId === undefined) {
      throw new Error(
        'Must pass in an id to the CvcEntitySubscriptionButtonComponent'
      )
    }
    if (this.entityType === undefined) {
      throw new Error(
        'Must pass in an entityType to the CvcEntitySubscriptionButtonComponent'
      )
    }
    if (this.entityType === 'EvidenceItem') {
      this.entityTypeDisplay = 'Evidence Item'
    } else {
      this.entityTypeDisplay = 'Assertion'
    }
    this.viewer$
      .pipe(pluck('mostRecentOrg'), untilDestroyed(this))
      .subscribe((org) => (this.mostRecentOrg = org))
  }

  moderate(newStatus: EvidenceStatus) {
    const action = newStatus.replace(/ED$/, '')
    const actionName = action.charAt(0) + action.slice(1).toLowerCase()

    this.modal.confirm({
      nzTitle: `${actionName} This ${this.entityTypeDisplay}`,
      nzOkText: actionName,
      nzCancelText: 'Cancel',
      nzContent: this.modalContents,
      nzData: { action: actionName, organization: this.mostRecentOrg?.name },
      nzOnOk: () => {
        this.submit(newStatus)
      },
    })
  }

  submit(newStatus: EvidenceStatus) {
    const onSuccess = () => {
      this.showConfirm = false
      this.onModerated.emit(newStatus)
    }
    const onError = (errs: FormSubmissionError[]) => {
      this.showConfirm = false
      this.onModerated.emit(errs.map((e) => e.message))
    }
    if (this.entityType === 'EvidenceItem') {
      this.submitState = this.formMutation.mutate(
        this.revertEvidenceGQL,
        {
          input: {
            evidenceItemId: this.entityId,
            organizationId: this.mostRecentOrg?.id,
            newStatus: newStatus,
            comment: this.confirmationComment,
          },
        },
        undefined,
        onSuccess,
        onError
      )
    } else {
      this.submitState = this.formMutation.mutate(
        this.revertAssertionGQL,
        {
          input: {
            assertionId: this.entityId,
            organizationId: this.mostRecentOrg?.id,
            newStatus: newStatus,
            comment: this.confirmationComment,
          },
        },
        undefined,
        onSuccess,
        onError
      )
    }
  }
}
