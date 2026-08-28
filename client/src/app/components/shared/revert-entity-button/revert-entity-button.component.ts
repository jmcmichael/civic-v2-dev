import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  ModerateAssertionGQL,
  ModerateEvidenceItemGQL,
} from './revert-entity-button.gql.generated'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  EvidenceStatus,
  Maybe,
  Organization,
} from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Observable } from 'rxjs'
import { pluck } from 'rxjs-etc/dist/esm/operators'

@UntilDestroy()
@Component({
  selector: 'cvc-revert-entity-button',
  templateUrl: './revert-entity-button.component.html',
  styleUrls: ['./revert-entity-button.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcRevertEntityButtonComponent implements OnInit {
  @Input() entityType!: 'EvidenceItem' | 'Assertion'
  @Input() entityId!: number

  @Output() onReverted = new EventEmitter<true | string[]>()

  submitState?: FormMutationState
  showConfirm = false
  revertComment?: string

  mostRecentOrg: Maybe<ViewerOrganizationFragment>

  viewer$: Observable<Viewer>
  constructor(
    private revertEvidenceGQL: ModerateEvidenceItemGQL,
    private revertAssertionGQL: ModerateAssertionGQL,
    private formMutation: FormMutationService,
    private viewerService: ViewerService
  ) {
    this.viewer$ = this.viewerService.viewer$
  }

  revert() {
    const onSuccess = () => {
      this.showConfirm = false
      this.onReverted.emit(true)
    }
    const onError = (errs: string[]) => {
      this.showConfirm = false
      this.onReverted.emit(errs)
    }
    if (this.entityType === 'EvidenceItem') {
      this.submitState = this.formMutation.mutate(
        this.revertEvidenceGQL,
        {
          input: {
            evidenceItemId: this.entityId,
            organizationId: this.mostRecentOrg?.id,
            newStatus: EvidenceStatus.Submitted,
            comment: this.revertComment,
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
            newStatus: EvidenceStatus.Submitted,
            comment: this.revertComment,
          },
        },
        undefined,
        onSuccess,
        onError
      )
    }
  }

  handleConfirmModalCancel() {
    this.showConfirm = false
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

    this.viewer$
      .pipe(pluck('mostRecentOrg'), untilDestroyed(this))
      .subscribe((org) => (this.mostRecentOrg = org))
  }
}
