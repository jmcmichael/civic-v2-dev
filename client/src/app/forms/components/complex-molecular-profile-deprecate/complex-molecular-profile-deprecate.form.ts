import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core'
import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  DeprecateComplexMolecularProfileGQL,
  DeprecateComplexMolecularProfileMutation,
  DeprecateComplexMolecularProfileMutationVariables,
  EvidenceCountsForMolecularProfileGQL,
} from './complex-molecular-profile-deprecate.query.gql.generated'
import {
  MolecularProfileDeprecationReasonMutationInput,
  Maybe,
  Organization,
} from '@app/generated/civic.apollo.types'
import { MolecularProfileDetailGQL } from '@app/views/molecular-profiles/molecular-profiles-detail/molecular-profiles-detail.query.gql.generated'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { map, takeUntil } from 'rxjs/operators'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
@Component({
  selector: 'cvc-complex-molecular-profile-deprecate-form',
  templateUrl: './complex-molecular-profile-deprecate.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ComplexMolecularProfileDeprecateForm implements OnDestroy, OnInit {
  private formMutation = inject(FormMutationService)
  @Input() molecularProfileId!: number

  private destroy$ = new Subject<void>()

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return (this.mutationState?.errors() ?? []).map((e) => e.message)
  }
  get mutationLoading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  viewer$: Observable<Viewer>

  comment: string = ''
  reason: Maybe<MolecularProfileDeprecationReasonMutationInput>
  selectedOrg: Maybe<ViewerOrganizationFragment>

  hasEvidence$?: Observable<boolean>
  isLoading$?: Observable<boolean>

  constructor(
    private deprecateComplexMolecularProfileGQL: DeprecateComplexMolecularProfileGQL,
    private molecularProfileDetailGQL: MolecularProfileDetailGQL,
    private evidenceCountsForMolecularProfileGQL: EvidenceCountsForMolecularProfileGQL,
    private route: ActivatedRoute,
    private viewerService: ViewerService
  ) {
    this.viewer$ = this.viewerService.viewer$
  }

  ngOnInit() {
    this.viewerService.viewer$
      .pipe(untilDestroyed(this))
      .subscribe((v: Viewer) => {
        this.selectedOrg = v.mostRecentOrg
      })

    if (this.molecularProfileId === undefined) {
      throw new Error(
        'Must pass a molecular profile id into deprecate complex molecular profile component'
      )
    }

    let queryRef = this.evidenceCountsForMolecularProfileGQL.fetch({
      variables: {
        molecularProfileId: this.molecularProfileId,
      },
    })

    this.hasEvidence$ = queryRef.pipe(
      map(({ data }) => {
        const counts = data?.molecularProfile?.evidenceCountsByStatus
        return counts ? counts.submittedCount + counts.acceptedCount > 0 : false
      })
    )

    this.isLoading$ = queryRef.pipe(map(() => false))
  }

  deprecateMolecularProfile(): void {
    if (this.reason && this.comment && this.molecularProfileId) {
      let input = {
        deprecationReason: this.reason,
        comment: this.comment,
        molecularProfileId: this.molecularProfileId,
        organizationId: this.selectedOrg?.id,
      }

      this.mutationState = this.formMutation.mutate(
        this.deprecateComplexMolecularProfileGQL,
        input,
        {
          refetchQueries: [
            {
              query: this.molecularProfileDetailGQL.document,
              variables: { molecularProfileId: this.molecularProfileId },
            },
          ],
        },
        () => {
          this.success = true
          this.comment = ''
        }
      )
    }
  }

  onSuccessBannerClose() {
    this.success = false
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
