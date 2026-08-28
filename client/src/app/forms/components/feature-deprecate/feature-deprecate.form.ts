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
  DeprecateFeatureGQL,
  DeprecateFeatureMutation,
  DeprecateFeatureMutationVariables,
  VariantsForFeatureGQL,
} from './feature-deprecate.query.gql.generated'
import {
  Maybe,
  Organization,
  FeatureDeprecationReason,
} from '@app/generated/civic.apollo.types'
import { FeatureDetailGQL } from '@app/views/features/features-detail/features-detail.query.gql.generated'
import { Observable, Subject } from 'rxjs'
import { RouterModule } from '@angular/router'
import { map, takeUntil, filter } from 'rxjs/operators'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { isNonNulled } from 'rxjs-etc'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { CvcFormErrorsAlertModule } from '../form-errors-alert/form-errors-alert.module'
import { CvcFormButtonsModule } from '../form-buttons/form-buttons.module'
import { CvcCommentInputFormModule } from '../comment-input/comment-input.module'
import { CvcVariantTagModule } from '@app/components/variants/variant-tag/variant-tag.module'
import { LinkableVariant } from '@app/components/variants/variant-tag/variant-tag.component'

@UntilDestroy()
@Component({
  selector: 'cvc-feature-deprecate-form',
  templateUrl: './feature-deprecate.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LetDirective,
    PushPipe,
    NzFormModule,
    NzAlertModule,
    NzGridModule,
    NzButtonModule,
    NzSpinModule,
    NzCardModule,
    NzSpaceModule,
    NzTypographyModule,
    NzTooltipModule,
    NzSelectModule,
    CvcFormErrorsAlertModule,
    CvcFormButtonsModule,
    CvcCommentInputFormModule,
    CvcVariantTagModule,
  ],
})
export class CvcFeatureDeprecateForm implements OnDestroy, OnInit {
  private formMutation = inject(FormMutationService)
  @Input() featureId!: number

  private destroy$ = new Subject<void>()

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return (this.mutationState?.errors() ?? []).map((e) => e.message)
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  viewer$: Observable<Viewer>

  comment: string = ''
  reason: Maybe<FeatureDeprecationReason>
  selectedOrg: Maybe<ViewerOrganizationFragment>

  undeprecatedVariants$?: Observable<LinkableVariant[]>
  variantListLoading$?: Observable<boolean>

  constructor(
    private deprecateFeatureGQL: DeprecateFeatureGQL,
    private featureDetailGQL: FeatureDetailGQL,
    private variantsForFeatureGQL: VariantsForFeatureGQL,
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

    if (this.featureId === undefined) {
      throw new Error('Must pass a feature id into deprecate feature component')
    }

    let queryRef = this.variantsForFeatureGQL.fetch({
      variables: {
        featureId: this.featureId,
      },
    })

    this.undeprecatedVariants$ = queryRef.pipe(
      map(({ data }) => data?.variants.nodes),
      filter(isNonNulled),
      map((variants) => variants.filter((variant) => !variant.deprecated))
    )
    //
    //this.mpsWithEvidence$ = queryRef.pipe(
    //  map(({ data }) => data.molecularProfiles.nodes),
    //  filter(isNonNulled),
    //  map((mps) =>
    //    mps.filter(
    //      (mp) =>
    //        mp.evidenceCountsByStatus.submittedCount +
    //          mp.evidenceCountsByStatus.acceptedCount >
    //        0
    //    )
    //  )
    //)

    this.variantListLoading$ = queryRef.pipe(map(() => false))
  }

  deprecateFeature(): void {
    if (this.reason && this.comment && this.featureId) {
      let input = {
        deprecationReason: this.reason,
        comment: this.comment,
        featureId: this.featureId,
        organizationId: this.selectedOrg?.id,
      }

      this.mutationState = this.formMutation.mutate(
        this.deprecateFeatureGQL,
        input,
        {
          refetchQueries: [
            {
              query: this.featureDetailGQL.document,
              variables: { featureId: this.featureId },
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
