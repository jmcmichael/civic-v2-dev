import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { CvcSelectEntityName } from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EntityType } from '@app/forms2/states/entity.state'
import {
  DiseaseSelectTagGQL,
  DiseaseSelectTagQuery,
  DiseaseSelectTagQueryVariables,
  DiseaseSelectTypeaheadFieldsFragment,
  DiseaseSelectTypeaheadGQL,
  DiseaseSelectTypeaheadQuery,
  DiseaseSelectTypeaheadQueryVariables,
  Maybe,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, combineLatest, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export type CvcDiseaseSelectFieldOptions = Partial<
  FieldTypeConfig<CvcDiseaseSelectFieldProps>
>
// TODO: finish implementing updated props interface w/ labels, placeholders groups,
// and multiMax limits, multiDefault placeholder
export interface CvcDiseaseSelectFieldProps extends FormlyFieldProps {
  // entity names, singular & plural
  entityName: CvcSelectEntityName
  // if true, field is a multi-select & its model value should be an array
  isMultiSelect: boolean
  // if true, field disabled when no entity type available
  requireType: boolean
  labels: {
    // label if a multi type, showing optional plurality, e.g. 'Variant(s)'
    multi: string
    // label if multi type & model value length > 1
    plural: string
  }
  placeholders: {
    // default placeholder
    default: string
    // default placeholder for multi-selects
    multiDefault: string
    // placeholder if evidence/assertion type required & field disabled
    requireTypePrompt: string
  }
}

// NOTE: any multi-select field must have the string 'multi' in its type name,
// as UI logic (currently in base-field) depends on its presence to differentiate
// field types in some expressions
export interface CvcDiseaseSelectFieldConfig
  extends FormlyFieldConfig<CvcDiseaseSelectFieldProps> {
  type: 'disease-select' | 'disease-multi-select' | Type<CvcDiseaseSelectField>
}

const DiseaseSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcDiseaseSelectFieldProps>,
    Maybe<number | number[]>
  >(),
  EntityTagField<
    DiseaseSelectTypeaheadQuery,
    DiseaseSelectTypeaheadQueryVariables,
    DiseaseSelectTypeaheadFieldsFragment,
    DiseaseSelectTagQuery,
    DiseaseSelectTagQueryVariables,
    Maybe<number | number[]>
  >()
)

@Component({
  selector: 'cvc-disease-select',
  templateUrl: './disease-select.type.html',
  styleUrls: ['./disease-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcDiseaseSelectField
  extends DiseaseSelectMixin
  implements AfterViewInit
{
  // STATE SOURCE STREAMS
  onEntityType$?: Subject<Maybe<EntityType>>
  onRequiresDisease$?: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  placeholder$: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcDiseaseSelectFieldOptions = {
    props: {
      entityName: { singular: 'Disease', plural: 'Diseases' },
      label: 'Disease',
      labels: {
        multi: 'Disease(s)',
        plural: 'Diseases',
      },
      isMultiSelect: false,
      requireType: true,
      // TODO: implement labels/placeholders w/ string replacement using typescript
      // template strings: https://www.codevscolor.com/typescript-template-string
      placeholders: {
        default: 'Search Diseases',
        multiDefault: 'Select Disease(s) (max MULTI_MAX)',
        requireTypePrompt: 'Select an ENTITY_NAME Type to select Diseases',
      },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  stateEntityName?: string

  constructor(
    private taq: DiseaseSelectTypeaheadGQL,
    private tq: DiseaseSelectTagGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super()
    this.placeholder$ = new BehaviorSubject<string>(
      this.defaultOptions.props!.placeholders!.default
    )
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEntityTagField({
      // mixin fn
      typeaheadQuery: this.taq,
      typeaheadParam$: undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: this.getTypeaheadVarsFn,
      getTypeaheadResultsFn: this.getTypeaheadResultsFn,
      getTagQueryVarsFn: this.getTagQueryVarsFn,
      getTagQueryResultsFn: this.getTagQueryResultsFn,
      getSelectedItemOptionFn: this.getSelectedItemOptionFn,
      getSelectOptionsFn: this.getSelectOptionsFn,
      changeDetectorRef: this.changeDetectorRef,
    })
    this.configurePlaceholders()
    this.configureLabels()
  } // ngAfterViewInit()

  configureStateConnections(): void {
    if (!this.state) return
    this.stateEntityName = this.state.entityName
    // connect to onRequiresDisease$
    if (!this.state.requires.requiresDisease$) {
      console.warn(
        `${this.field.id} field's form provides a state, but could not find requiresDisease$ subject to attach.`
      )
    } else {
      this.onRequiresDisease$ = this.state.requires.requiresDisease$
    }

    // connect onEntityType$
    if (this.props.requireType) {
      const etName = `${this.stateEntityName.toLowerCase()}Type$`
      if (!this.state.fields[etName]) {
        console.error(
          `${this.field.id} requireType is true, however form state does not provide Subject ${etName}.`
        )
      } else {
        this.onEntityType$ = this.state.fields[etName]
        // this.onEntityType$.pipe(tag(`${this.field.id} onEntityType$`)).subscribe()
      }
    }
  }

  configurePlaceholders(): void {
    if (!this.onRequiresDisease$ || !this.onEntityType$) return
    // update field placeholders & required status on state input events
    combineLatest([this.onRequiresDisease$, this.onEntityType$])
      .pipe(tag(`${this.field.id} combineLatest`), untilDestroyed(this))
      .subscribe(
        ([requiresDisease, entityType]: [boolean, Maybe<EntityType>]) => {
          // diseases are not required for this entity type
          if (!requiresDisease && entityType) {
            this.props.required = false
            this.props.disabled = true
            // no disease required, entity type specified
            this.placeholder$.next(
              `${formatEvidenceEnum(entityType)} ${
                this.stateEntityName
              } does not include associated diseases`
            )
          }
          // if entity type is required, toggle field required property off,
          // and show a 'Select Type..' prompt
          if (!requiresDisease && !entityType && this.props.requireType) {
            this.props.required = false
            this.props.disabled = false
            // no disease required, entity type not specified
            this.placeholder$.next(
              `Select ${this.stateEntityName} Type to select diseases`
            )
          }
          // state indicates disease is required, toggle field required property,
          // and show the placeholder
          if (requiresDisease) {
            this.props.required = true
            this.props.disabled = false
            this.placeholder$.next('Search Diseases')
          }
          // field currently has a value, but state indicates no disease is required,
          // or no type is provided && type is required, so reset field
          if (
            (!requiresDisease && this.formControl.value) ||
            (this.props.requireType && !entityType && this.formControl.value)
          ) {
            this.resetField()
          }
        }
      )
  }

  getTypeaheadVarsFn(str: string): DiseaseSelectTypeaheadQueryVariables {
    return { name: str }
  }

  getTypeaheadResultsFn(r: ApolloQueryResult<DiseaseSelectTypeaheadQuery>) {
    return r.data.diseaseTypeahead
  }

  getTagQueryVarsFn(id: number): DiseaseSelectTagQueryVariables {
    return { id: id }
  }

  getTagQueryResultsFn(
    r: ApolloQueryResult<DiseaseSelectTagQuery>
  ): Maybe<DiseaseSelectTypeaheadFieldsFragment> {
    return r.data.disease
  }

  getSelectedItemOptionFn(
    disease: DiseaseSelectTypeaheadFieldsFragment
  ): NzSelectOptionInterface {
    return { value: disease.id, label: disease.name }
  }

  getSelectOptionsFn(
    results: DiseaseSelectTypeaheadFieldsFragment[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return results.map(
      (disease: DiseaseSelectTypeaheadFieldsFragment, index: number) => {
        return <NzSelectOptionInterface>{
          label: tplRefs.get(index) || disease.name,
          value: disease.id,
        }
      }
    )
  }
}
