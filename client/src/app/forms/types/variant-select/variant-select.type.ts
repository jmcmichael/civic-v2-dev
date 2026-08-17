import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core'
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule } from '@angular/forms'
import {
  CvcEntitySelectDirective,
  CvcEntitySelectFieldBase,
  CvcEntitySelectFieldProps,
  CvcHighlightComponent,
  CvcSelectAddFormComponent,
  CvcSelectMessagesComponent,
  entitySelectConfig,
} from '@app/forms/select'
import {
  FeatureSelectTagGQL,
  FeatureSelectTypeaheadFieldsFragment,
} from '@app/forms/types/feature-select/feature-select.query.gql.generated'
import { fieldOf } from '@app/forms/states/base.state'
import { FeatureInstanceTypes, Maybe } from '@app/generated/civic.apollo.types'
import { CvcTagComponent, TaggableTypename } from '@app/tags'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { map } from 'rxjs'
import {
  CvcFusionVariantSelectForm,
  FusionVariantSelectModalData,
} from './fusion-variant-select/fusion-variant-select.form'
import {
  CvcRegionVariantSelectForm,
  RegionVariantSelectModalData,
} from './region-variant-select/region-variant-select.form'
import { CvcVariantManagerComponent } from './variant-manager/variant-manager.component'
import { CvcVariantQuickAddForm } from './variant-quick-add/variant-quick-add.form'
import {
  VariantSelectTagGQL,
  VariantSelectTypeaheadFieldsFragment,
  VariantSelectTypeaheadGQL,
} from './variant-select.query.gql.generated'

export interface VariantIdWithCreationStatus {
  new: boolean
  id: number
}

// props is Partial here because config sites set only what they override and
// let the field's defaultOptions supply the rest
export type CvcVariantSelectFieldOptions = Partial<
  FieldTypeConfig<Partial<CvcVariantSelectFieldProps>>
>

export interface CvcVariantSelectFieldProps extends CvcEntitySelectFieldProps {
  /** disables the field until the form's Feature field has a value */
  requireFeature: boolean
  /** placeholder once a Feature is chosen, e.g. "Search BRAF Variants" */
  requireFeaturePlaceholderFn: (featureName: string) => string
  /** shown beneath the field while no Feature is chosen */
  requireFeaturePrompt: string
  /** shows the variant manager button */
  showManagerBtn?: boolean
  /** offer the add form even when the search already matches something */
  alwaysShowCreate?: boolean
  /** notified whether the variant that landed in the field was just created */
  isNewlyCreatedCallback?: (isNewlyCreated: boolean) => void
  /** notified of the selected Feature's type */
  featureTypeCallback?: (featureType: Maybe<FeatureInstanceTypes>) => void
}

// NOTE: any multi-select field must have the string 'multi' in its type name,
// as UI logic (currently in base-field) depends on its presence to differentiate
// field types in some expressions
export interface CvcVariantSelectFieldConfig extends FormlyFieldConfig<CvcVariantSelectFieldProps> {
  type: 'variant-select' | 'variant-multi-select' | Type<CvcVariantSelectField>
}

/** a name has to be this long before the quick-add form is worth offering */
const MIN_ADD_NAME_LENGTH = 3

/**
 * What a builder modal resolves with. Deliberately distinct from the
 * *ModalData types, which describe what is passed *in* via nzData — the
 * result needs its own type or it is effectively untyped.
 */
interface VariantBuilderResult {
  variantId?: number
}

/**
 * Selects a Variant within one Feature, with three ways to create one: an
 * inline quick-add, and a modal builder each for Fusion and Region variants.
 *
 * The Feature comes from a sibling field via form state, not from this
 * field's own UI — it is a parameter gate, not the entity-type gate the
 * disease and therapy selects use, so this extends the plain base rather than
 * CvcTypeGatedSelectFieldBase.
 *
 * Variants are the one genuinely polymorphic select: the tag query resolves
 * to GeneVariant, FactorVariant, FusionVariant, RegionVariant or plain
 * Variant, so the tag typename is resolved per result. The typeahead itself
 * only ever returns plain Variant.
 */
@Component({
  selector: 'cvc-variant-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    // supplies NzModalService, which opens the two variant builders
    NzModalModule,
    NzSelectModule,
    NzSpaceModule,
    NzTooltipModule,
    NzTypographyModule,
    CvcTagComponent,
    CvcEntitySelectDirective,
    CvcHighlightComponent,
    CvcSelectAddFormComponent,
    CvcSelectMessagesComponent,
    CvcVariantQuickAddForm,
    CvcVariantManagerComponent,
  ],
  templateUrl: './variant-select.type.html',
  styleUrl: './variant-select.type.less',
})
export class CvcVariantSelectField extends CvcEntitySelectFieldBase<
  VariantSelectTypeaheadFieldsFragment,
  Maybe<number>,
  CvcVariantSelectFieldProps
> {
  private readonly typeaheadGQL = inject(VariantSelectTypeaheadGQL)
  private readonly tagGQL = inject(VariantSelectTagGQL)
  private readonly featureGQL = inject(FeatureSelectTagGQL)
  private readonly modal = inject(NzModalService)

  protected readonly select = entitySelectConfig({
    entityName: { singular: 'Variant', plural: 'Variants' },
    typename: (result: VariantSelectTypeaheadFieldsFragment) =>
      result.__typename as TaggableTypename,
    typeahead: this.typeaheadGQL,
    typeaheadVars: (name: string, featureId: Maybe<number>) => ({
      name,
      featureId,
    }),
    typeaheadResults: (data) => data?.variantsTypeahead ?? [],
    tag: {
      query: this.tagGQL,
      vars: (variantId: number) => ({ variantId }),
      result: (data) => data?.variant,
    },
  })

  /**
   * The scoping Feature's record, fetched cache-first whenever `param`
   * changes. A resource rather than a hand-rolled fetch/subscribe: a rapid
   * feature change cancels the in-flight lookup, so a slow earlier fetch can
   * never land after — and overwrite — a later one.
   */
  private readonly featureResource = rxResource({
    params: () => this.param() ?? undefined,
    stream: ({ params: featureId }) =>
      this.featureGQL
        .fetch({ variables: { featureId }, fetchPolicy: 'cache-first' })
        .pipe(map((r) => r.data?.feature ?? undefined)),
    defaultValue: undefined,
  })

  /** the Feature this field is scoped to, once its record has arrived */
  private readonly selectedFeature = computed(() =>
    this.featureResource.hasValue() ? this.featureResource.value() : undefined
  )

  /** the config's own alwaysShowCreate, under the per-feature derivation */
  private configuredAlwaysShowCreate = false

  protected readonly showManager = signal(false)

  protected readonly disabled = computed(
    () => this.props.requireFeature && !this.param()
  )

  /** which of the three add paths the selected Feature's type calls for */
  protected readonly addPath = computed<'fusion' | 'region' | 'quick-add'>(
    () => {
      switch (this.selectedFeature()?.featureType) {
        case FeatureInstanceTypes.Fusion:
          return 'fusion'
        case FeatureInstanceTypes.Region:
          return 'region'
        default:
          return 'quick-add'
      }
    }
  )

  defaultOptions: Partial<FieldTypeConfig<CvcVariantSelectFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search Variants',
      entityName: { singular: 'Variant', plural: 'Variants' },
      isMultiSelect: false,
      requireFeature: true,
      requireFeaturePlaceholderFn: (featureName: string) =>
        `Search ${featureName} Variants`,
      requireFeaturePrompt: 'Select a Feature to search its Variants',
      showManagerBtn: false,
      alwaysShowCreate: false,
    },
  }

  override ngOnInit(): void {
    super.ngOnInit()
    this.configuredAlwaysShowCreate = this.props.alwaysShowCreate ?? false
    if (!this.props.requireFeature) return
    this.connectFeature()
  }

  protected toggleManager(): void {
    this.showManager.update((shown) => !shown)
  }

  /** the manager emits the complete selection, so this replaces the value */
  protected onManagerSelection(ids: Maybe<number[]>): void {
    const value = ids ?? []
    this.formControl.setValue(value)
    this.fetchTagRecords(value).subscribe()
  }

  protected override showAddForm(
    searchStr: string,
    results: VariantSelectTypeaheadFieldsFragment[]
  ): boolean {
    if (this.props.alwaysShowCreate) return true
    const name = searchStr.toLowerCase()
    return (
      searchStr.length >= MIN_ADD_NAME_LENGTH &&
      !results.some((r) => r.name.toLowerCase() === name)
    )
  }

  /** the inline quick-add reports whether it created the Variant or found it */
  protected onVariantQuickAdd(variant: VariantIdWithCreationStatus): void {
    this.props.isNewlyCreatedCallback?.(variant.new)
    this.props.featureTypeCallback?.(this.selectedFeature()?.featureType)
    this.onEntityCreated(variant.id)
  }

  protected createFusionVariantModal(): void {
    this.openBuilder(
      CvcFusionVariantSelectForm,
      'Add New Fusion Variant',
      '60%'
    )
  }

  protected createRegionVariantModal(): void {
    this.openBuilder(
      CvcRegionVariantSelectForm,
      'Add New Region Variant',
      '500px'
    )
  }

  /**
   * Both builders report their result by destroying the modal with it.
   * Dismissing one any other way (the close icon, ESC, the mask) resolves
   * with nothing, so the result must be guarded before dereferencing.
   */
  private openBuilder<T>(content: Type<T>, title: string, width: string): void {
    const modal = this.modal.create<
      T,
      FusionVariantSelectModalData | RegionVariantSelectModalData
    >({
      nzTitle: title,
      nzContent: content,
      nzData: { feature: this.selectedFeature() },
      nzFooter: null,
      nzWidth: width,
    })

    modal.afterClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result?: VariantBuilderResult) => {
        if (!result?.variantId) return
        this.onVariantQuickAdd({ id: result.variantId, new: true })
      })
  }

  /**
   * Scopes the typeahead to the form's chosen Feature, and drops the selected
   * Variant when that Feature changes (never on first run — a revise form's
   * initial Feature accompanies its prepopulated Variant; see
   * `connectClearOnChange`).
   */
  private connectFeature(): void {
    const featureId = fieldOf<number>(this.state, 'featureId')
    if (!featureId) {
      console.error(
        `${this.field.id} requireFeature is set, but no featureId found on state.`
      )
      return
    }
    this.connectClearOnChange(featureId)
    effect(() => this.param.set(featureId()), { injector: this.injector })
    effect(() => this.describeFeature(this.param(), this.selectedFeature()), {
      injector: this.injector,
    })
  }

  private describeFeature(
    featureId: Maybe<number>,
    feature: Maybe<FeatureSelectTypeaheadFieldsFragment>
  ): void {
    if (!featureId) {
      this.paramName.set(undefined)
      this.applyProps({
        description: this.props.requireFeaturePrompt,
        placeholder: 'Select a Variant',
        extraType: 'prompt',
      })
      return
    }
    if (!feature) {
      // record still arriving; drop the prompt without describing yet
      this.applyProps({ description: undefined, extraType: undefined })
      return
    }
    this.paramName.set(feature.name)
    this.applyProps({
      description: undefined,
      extraType: undefined,
      placeholder: this.props.requireFeaturePlaceholderFn(feature.name),
      // a Region variant is always worth offering to build. Derived per
      // feature — earlier code latched `true` permanently once any Region
      // feature had been chosen
      alwaysShowCreate:
        this.configuredAlwaysShowCreate ||
        feature.featureType === FeatureInstanceTypes.Region,
    })
  }
}
