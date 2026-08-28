import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core'
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms'
import { FeatureSelectTypeaheadFieldsFragment } from '@app/forms/types/feature-select/feature-select.query.gql.generated'
import {
  SelectOrCreateRegionVariantGQL,
  SelectOrCreateRegionVariantMutation,
  SelectOrCreateRegionVariantMutationVariables,
} from './region-variant-add.query.gql.generated'
import { RegionVariantName } from '@app/generated/civic.apollo.types'
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FormlyModule,
} from '@ngx-formly/core'
import { NzFormLayoutType } from 'ng-zorro-antd/form'

import { NzFormModule } from 'ng-zorro-antd/form'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { RouterModule } from '@angular/router'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { UntilDestroy } from '@ngneat/until-destroy'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal'
import { CvcFeatureTagModule } from '@app/components/features/feature-tag/feature-tag.module'
import { CvcOrgSubmitButtonTypeModule } from '@app/forms/types/org-submit-button/org-submit-button.type.module'
import { CvcRegionVariantSelectFieldsModule } from './region-variant-select-fields.module'

type RegionVariantSelectModel = {
  name?: RegionVariantName
  organizationId?: number
}

export interface RegionVariantSelectModalData {
  feature?: FeatureSelectTypeaheadFieldsFragment
}

@UntilDestroy()
@Component({
  selector: 'cvc-region-variant-select-form',
  templateUrl: './region-variant-select.form.html',
  styleUrls: ['./region-variant-select.form.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzAlertModule,
    NzModalModule,
    RouterModule,
    FormlyModule,
    CvcFeatureTagModule,
    CvcOrgSubmitButtonTypeModule,
    CvcRegionVariantSelectFieldsModule,
  ],
})
export class CvcRegionVariantSelectForm {
  @Output() onVariantSelected = new EventEmitter<number>()

  readonly #modal = inject(NzModalRef)
  readonly nzModalData: RegionVariantSelectModalData = inject(NZ_MODAL_DATA)

  model: RegionVariantSelectModel
  form: UntypedFormGroup
  config: FormlyFieldConfig[]
  layout: NzFormLayoutType = 'vertical'

  options: FormlyFormOptions

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState

  constructor(
    private query: SelectOrCreateRegionVariantGQL,
    errors: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})

    this.model = {
      name: undefined,
    }
    this.options = {}

    this.config = [
      {
        wrappers: ['form-layout'],
        props: {
          showDevPanel: false,
        },
        fieldGroup: [
          {
            wrappers: ['form-card'],
            props: {
              formCardOptions: {
                title: `New Region Variant for ${this.nzModalData.feature?.name}`,
              },
            },
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'name',
                    type: 'region-variant-name-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      required: true,
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'organizationId',
                    type: 'org-submit-button',
                    wrappers: ['col'],
                    props: {
                      col: { span: 24 },
                      submitLabel: 'Create Region Variant',
                      align: 'right',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  }

  submitRegion(model: RegionVariantSelectModel): void {
    const featureId = this.nzModalData.feature?.id

    if (model && featureId) {
      this.mutationState = this.formMutation.mutate(
        this.query,
        {
          organizationId: model.organizationId,
          featureId: featureId,
          name: model.name!,
        },
        {},
        (data) => {
          if (data.createRegionVariant?.variant.id) {
            const variantId = data.createRegionVariant.variant.id
            this.onVariantSelected.next(variantId)
            if (this.#modal) {
              this.#modal.destroy({ variantId: variantId })
            }
          }
        }
      )
    }
  }
}
