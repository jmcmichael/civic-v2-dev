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
import { EntityState, EntityType } from '@app/forms2/states/entity.state'
import {
  DrugSelectTagGQL,
  DrugSelectTagQuery,
  DrugSelectTagQueryVariables,
  DrugSelectTypeaheadFieldsFragment,
  DrugSelectTypeaheadGQL,
  DrugSelectTypeaheadQuery,
  DrugSelectTypeaheadQueryVariables,
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
import mixin from 'ts-mixin-extended'

export type CvcDrugSelectFieldOptions = Partial<
  FieldTypeConfig<CvcDrugSelectFieldProps>
>
// TODO: finish implementing updated props interface w/ labels, placeholders groups,
// and multiMax limits, multiDefault placeholder
export interface CvcDrugSelectFieldProps extends FormlyFieldProps {
  // entity names, singular & plural
  entityName: CvcSelectEntityName
  // if true, field is a multi-select & its model value should be an array
  isMultiSelect: boolean
  // max number of values permitted by model
  multiMax: number
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
export interface CvcDrugSelectFieldConfig
  extends FormlyFieldConfig<CvcDrugSelectFieldProps> {
  type: 'drug-select' | 'drug-multi-select' | Type<CvcDrugSelectField>
}

const DrugSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcDrugSelectFieldProps>,
    Maybe<number | number[]>
  >(),
  EntityTagField<
    DrugSelectTypeaheadQuery,
    DrugSelectTypeaheadQueryVariables,
    DrugSelectTypeaheadFieldsFragment,
    DrugSelectTagQuery,
    DrugSelectTagQueryVariables,
    Maybe<number | number[]>
  >()
)

@Component({
  selector: 'cvc-drug-select',
  templateUrl: './drug-select.type.html',
  styleUrls: ['./drug-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcDrugSelectField
  extends DrugSelectMixin
  implements AfterViewInit
{

  // STATE SOURCE STREAMS
  onEntityType$?: Subject<Maybe<EntityType>>
  onRequiresDrug$?: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  placeholder$: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcDrugSelectFieldOptions = {
    props: {
      entityName: { singular: 'Drug', plural: 'Drugs' },
      label: 'Drug',
      labels: {
        multi: 'Drug(s)',
        plural: 'Drugs',
      },
      isMultiSelect: false,
      multiMax: 3,
      requireType: true,
      // TODO: implement labels/placeholders w/ string replacement using typescript
      // template strings: https://www.codevscolor.com/typescript-template-string
      placeholders: {
        default: 'Search Drugs',
        multiDefault: 'Select Drug(s) (max MULTI_MAX)',
        requireTypePrompt: 'Select an ENTITY_NAME Type to select Drugs',
      },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  stateEntityName?: string

  constructor(
    private taq: DrugSelectTypeaheadGQL,
    private tq: DrugSelectTagGQL,
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
    // connect to onRequiresDrug$
    if (!this.state.requires.requiresDrug$) {
      console.warn(
        `${this.field.id} field's form provides a state, but could not find requiresDrug$ subject to attach.`
      )
    } else {
      this.onRequiresDrug$ = this.state.requires.requiresDrug$
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
      }
    }
  }

  configurePlaceholders(): void {
    if (!this.onRequiresDrug$ || !this.onEntityType$) return
    // update field placeholders & required status on state input events
    combineLatest([this.onRequiresDrug$, this.onEntityType$])
      .pipe(untilDestroyed(this))
      .subscribe(([reqDrug, entityType]: [boolean, Maybe<EntityType>]) => {
        if (!reqDrug && entityType) {
          this.props.required = false
          // no drug required, entity type specified
          this.placeholder$.next(
            `${formatEvidenceEnum(entityType)} ${
              this.stateEntityName
            } does not include associated drugs`
          )
        }
        // if entity type is required, toggle field required property off,
        // and show a 'Select Type..' prompt
        if (!reqDrug && !entityType && this.props.requireType) {
          this.props.required = false
          // no drug required, entity type not specified
          this.placeholder$.next(
            `Select ${this.stateEntityName} Type to select drugs`
          )
        }
        // state indicates drug is required, toggle field required property,
        // and show the default or multi placeholder
        if (reqDrug) {
          this.props.required = true
          this.placeholder$.next('Search Drugs')
        }
        // field currently has a value, but state indicates no drug is required,
        // or no type is provided && type is required, so reset field
        if (
          (!reqDrug && this.formControl.value) ||
          (this.props.requireType && !entityType && this.formControl.value)
        ) {
          this.resetField()
        }
      })
  }

  getTypeaheadVarsFn(str: string): DrugSelectTypeaheadQueryVariables {
    return { name: str }
  }

  getTypeaheadResultsFn(r: ApolloQueryResult<DrugSelectTypeaheadQuery>) {
    return r.data.drugTypeahead
  }

  getTagQueryVarsFn(id: number): DrugSelectTagQueryVariables {
    return { id: id }
  }

  getTagQueryResultsFn(
    r: ApolloQueryResult<DrugSelectTagQuery>
  ): Maybe<DrugSelectTypeaheadFieldsFragment> {
    return r.data.drug
  }

  getSelectedItemOptionFn(
    drug: DrugSelectTypeaheadFieldsFragment
  ): NzSelectOptionInterface {
    return { value: drug.id, label: drug.name }
  }

  getSelectOptionsFn(
    results: DrugSelectTypeaheadFieldsFragment[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return results.map(
      (drug: DrugSelectTypeaheadFieldsFragment, index: number) => {
        return <NzSelectOptionInterface>{
          label: tplRefs.get(index) || drug.name,
          value: drug.id,
        }
      }
    )
  }
}
