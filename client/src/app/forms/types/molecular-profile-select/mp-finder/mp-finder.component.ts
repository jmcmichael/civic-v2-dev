import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { EntityFieldSignalMap } from '@app/forms/states/base.state'
import { CvcRowWrapperProps } from '@app/forms/wrappers/grid/row.wrapper'
import {
  FeatureInstanceTypes,
  Maybe,
  MolecularProfile,
  Variant,
} from '@app/generated/civic.apollo.types'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { Apollo } from 'apollo-angular'
import { readCachedVariant } from '../../variant-select/cached-variant'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { BehaviorSubject } from 'rxjs'
import { CvcVariantSelectFieldOptions } from '../../variant-select/variant-select.type'
import { EnumToTitlePipe } from '@app/core/pipes/enum-to-title-pipe'

type MpFinderModel = {
  featureId?: number
  variantId?: number
}

type MpFinderState = {
  formLayout: NzFormLayoutType
  // deliberately the erased map — a finder state offers only field slots for
  // its fields to publish into; the entity-state surface does not apply
  fields: EntityFieldSignalMap
}

@Component({
  selector: 'cvc-mp-finder',
  templateUrl: './mp-finder.component.html',
  styleUrls: ['./mp-finder.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MpFinderComponent {
  @Output() cvcOnSelect = new EventEmitter<MolecularProfile>()
  @Output() cvcOnVariantSelect = new EventEmitter<Variant>()

  modelChange$ = new BehaviorSubject<Maybe<MpFinderModel>>(undefined)
  model: MpFinderModel
  form: UntypedFormGroup
  config: FormlyFieldConfig[]
  featureType?: FeatureInstanceTypes

  finderState: MpFinderState = {
    formLayout: 'horizontal',
    fields: {
      featureId: signal<Maybe<number>>(undefined),
      variantId: signal<Maybe<number>>(undefined),
      variantMolecularProfile: signal<Maybe<MolecularProfile>>(undefined),
    },
  }
  options: FormlyFormOptions
  constructor(private apollo: Apollo) {
    this.form = new UntypedFormGroup({})
    this.model = { featureId: undefined, variantId: undefined }
    this.options = { formState: this.finderState }

    this.config = [
      {
        wrappers: ['row'],
        props: <CvcRowWrapperProps>{
          row: { gutter: [8, 0] }, // zero vertical gutter: single-line finder row
        },
        fieldGroup: [
          {
            key: 'featureId',
            type: 'feature-select',
            wrappers: ['col', 'form-field'],
            props: {
              col: { span: 12 },
              placeholder: 'Select MP Feature',
              hideLabel: true,
              showExtra: false,
              showErrorTip: false,
              required: true,
              featureTypeCallback: (ft: FeatureInstanceTypes) => {
                this.featureType = ft
              },
            },
          },
          <CvcVariantSelectFieldOptions>{
            key: 'variantId',
            type: 'variant-select',
            wrappers: ['col', 'form-field'],
            props: {
              col: { span: 12 },
              placeholder: 'Select MP Variant',
              hideLabel: true,
              required: true,
              showExtra: false,
              showErrorTip: false,
              requireFeature: true,
            },
          },
        ],
      },
    ]
  }

  modelChange(model: Maybe<MpFinderModel>) {
    if (!model?.variantId) return
    const variant = this.getSelectedVariant(model.variantId)
    if (variant) {
      this.model = {
        featureId: undefined,
        variantId: undefined,
      }
      this.cvcOnSelect.next(variant.singleVariantMolecularProfile)
      this.cvcOnVariantSelect.next(variant)
    }
  }

  getSelectedVariant(variantId: Maybe<number>): Maybe<Variant> {
    const feature = new EnumToTitlePipe().transform(this.featureType)
    const variant = readCachedVariant(
      this.apollo,
      variantId,
      `${feature}Variant`
    )
    if (!variant) {
      console.error(`MpFinderForm could not resolve its Variant from the cache`)
      return
    }
    return variant as Variant
  }
}
