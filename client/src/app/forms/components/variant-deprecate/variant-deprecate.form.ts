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
  DeprecateVariantGQL,
  DeprecateVariantMutation,
  DeprecateVariantMutationVariables,
  MolecularProfilesForVariantGQL,
} from './variant-deprecate.query.gql.generated'
import {
  VariantDeprecationReason,
  Maybe,
  Organization,
} from '@app/generated/civic.apollo.types'
import { VariantDetailGQL } from '@app/views/variants/variants-detail/variants-detail.query.gql.generated'
import { Observable, Subject } from 'rxjs'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { ActivatedRoute } from '@angular/router'
import { map, takeUntil, filter } from 'rxjs/operators'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { LinkableMolecularProfile } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.component'
import { isNonNulled } from 'rxjs-etc'
import { isDefined } from '@app/core/utilities/defined-typeguard'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
@Component({
  selector: 'cvc-variant-deprecate-form',
  templateUrl: './variant-deprecate.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class VariantDeprecateForm implements OnDestroy, OnInit {
  private formMutation = inject(FormMutationService)
  @Input() variantId!: number

  private destroy$ = new Subject<void>()

  submittedGeneId: Maybe<number>
  submittedVariantId: Maybe<number>

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return this.mutationState?.errors() ?? []
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  viewer$: Observable<Viewer>

  comment: string = ''
  reason: Maybe<VariantDeprecationReason>
  selectedOrg: Maybe<ViewerOrganizationFragment>

  mpsToDeprecate$?: Observable<LinkableMolecularProfile[]>
  mpsWithEvidence$?: Observable<LinkableMolecularProfile[]>
  mpListLoading$?: Observable<boolean>

  constructor(
    private deprecateVariantGQL: DeprecateVariantGQL,
    private variantDetailGQL: VariantDetailGQL,
    private mpsForVariantGQL: MolecularProfilesForVariantGQL,
    private networkErrorService: NetworkErrorsService,
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

    if (this.variantId === undefined) {
      throw new Error('Must pass a variant id into deprecate variant component')
    }

    let queryRef = this.mpsForVariantGQL.fetch({
      variables: { variantId: this.variantId },
    })

    this.mpsToDeprecate$ = queryRef.pipe(
      map(({ data }) => data?.molecularProfiles.nodes),
      filter(isNonNulled),
      map((mps) =>
        mps.filter(
          (mp) =>
            mp.evidenceCountsByStatus.submittedCount +
              mp.evidenceCountsByStatus.acceptedCount ==
            0
        )
      )
    )

    this.mpsWithEvidence$ = queryRef.pipe(
      map(({ data }) => data?.molecularProfiles.nodes),
      filter(isNonNulled),
      map((mps) =>
        mps.filter(
          (mp) =>
            mp.evidenceCountsByStatus.submittedCount +
              mp.evidenceCountsByStatus.acceptedCount >
            0
        )
      )
    )

    this.mpListLoading$ = queryRef.pipe(map(() => false))
  }

  deprecateVariant(): void {
    if (this.reason && this.comment && this.variantId) {
      let input = {
        deprecationReason: this.reason,
        comment: this.comment,
        variantId: this.variantId,
        organizationId: this.selectedOrg?.id,
      }

      this.mutationState = this.formMutation.mutate(
        this.deprecateVariantGQL,
        input,
        {
          refetchQueries: [
            {
              query: this.variantDetailGQL.document,
              variables: { variantId: this.variantId },
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
