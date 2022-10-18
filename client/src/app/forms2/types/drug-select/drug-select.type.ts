import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import {
  CvcSelectEntityName,
  CvcSelectMessageOptions,
} from '@app/forms2/components/entity-select/entity-select.component'
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
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

export type CvcDrugSelectFieldOptions = Partial<FieldTypeConfig<CvcDrugSelectFieldProps>>

export interface CvcDrugSelectFieldProps extends FormlyFieldProps {
  isMultiSelect: boolean // is child of a repeat-field type
  entityName: CvcSelectEntityName
  placeholder?: string // default placeholder
  requireType: boolean // if entity type required to enable field
  requireTypePlaceholder?: string // placeholder if evidence/assertion type required
}

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
  state?: EntityState

  // STATE SOURCE STREAMS
  onEntityType$?: Subject<Maybe<EntityType>>
  onRequiresDrug$?: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number | number[]>>

  // FieldTypeConfig defaults
  defaultOptions: CvcDrugSelectFieldOptions = {
    props: {
      label: 'Drug',
      isMultiSelect: false,
      entityName: { singular: 'Drug', plural: 'Drugs' },
      placeholder: 'Search Drugs',
      requireType: true,
      requireTypePlaceholder: 'Select a ENTITY_TYPE Type to search Drugs',
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(
    private taq: DrugSelectTypeaheadGQL,
    private tq: DrugSelectTagGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super()
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
  } // ngAfterViewInit()

  configureStateConnections(): void {
    this.state = this.field.options?.formState
    if (!this.state) return
    if (this.state.requires.requiresDrug$) {
      this.onRequiresDrug$ = this.state.requires.requiresDrug$
    } else {
      console.warn(
        `${this.field.id} field's form provides a state, but could not find requiresDrug$ subject to attach.`
      )
    }
    if (this.props.requireType) {
      const etName = `${this.state.entityName.toLowerCase()}Type$`
      if (this.state.fields[etName]) {
        this.onEntityType$ = this.state.fields[etName]
      } else {
        console.error(
          `${this.field.id} requireType is true, however form state does not provide Subject ${etName}.`
        )
      }
    }
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
