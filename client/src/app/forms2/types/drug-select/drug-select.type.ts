import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import {
  CvcSelectEntityName,
  CvcSelectMessageOptions,
} from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base-DEPRECATED'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EntityState } from '@app/forms2/states/entity.state'
import {
  Drug,
  DrugSelectPrepopulateGQL,
  DrugSelectPrepopulateQuery,
  DrugSelectPrepopulateQueryVariables,
  DrugSelectTypeaheadFieldsFragment,
  DrugSelectTypeaheadGQL,
  DrugSelectTypeaheadQuery,
  DrugSelectTypeaheadQueryVariables,
  LinkableDrugQuery,
  Maybe,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { QueryRef } from 'apollo-angular'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  Subject,
  withLatestFrom,
} from 'rxjs'
import { combineLatestArray, isNonNulled } from 'rxjs-etc'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcDrugSelectFieldProps extends FormlyFieldProps {
  isMultiSelect: boolean // is child of a repeat-field type
  entityName: CvcSelectEntityName
  selectMessages?: CvcSelectMessageOptions
  placeholder?: string // default placeholder
}

export interface CvcDrugSelectFieldConfig
  extends FormlyFieldConfig<CvcDrugSelectFieldProps> {
  type: 'drug-select' | 'drug-select-array' | Type<CvcDrugSelectField>
}

const DrugSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcDrugSelectFieldProps>, Maybe<number>>(),
  EntityTagField<
    DrugSelectTypeaheadQuery,
    DrugSelectTypeaheadQueryVariables,
    DrugSelectTypeaheadFieldsFragment,
    DrugSelectPrepopulateQuery,
    DrugSelectPrepopulateQueryVariables,
    DrugSelectTypeaheadFieldsFragment,
    Maybe<number>
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
  queryRef!: QueryRef<
    DrugSelectTypeaheadQuery,
    DrugSelectTypeaheadQueryVariables
  >

  state?: EntityState

  // STATE SOURCE STREAMS
  onRequiresDrug$: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS

  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>

  @ViewChild('optionContext', { read: ViewContainerRef, static: false })
  optionViewContainer?: ViewContainerRef
  @ViewChild('optionTemplate', { read: TemplateRef, static: false })
  optionTemplate?: TemplateRef<any>
  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(
    public injector: Injector,
    private taq: DrugSelectTypeaheadGQL,
    private tq: DrugSelectPrepopulateGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector)
    this.onRequiresDrug$ = new BehaviorSubject<boolean>(true)
    this.selectOption$ = new BehaviorSubject<NzSelectOptionInterface[]>([])
  }

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcDrugSelectFieldProps>> = {
    props: {
      label: 'Drug',
      isMultiSelect: false,
      entityName: { singular: 'Drug', plural: 'Drugs' },
    },
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections()
    this.configureEntityTagField({
      typeaheadQuery: this.taq,
      typeaheadParam$: undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: (str: string) => ({ name: str }),
      getTypeaheadResultsFn: (r: ApolloQueryResult<DrugSelectTypeaheadQuery>) =>
        r.data.drugTypeahead,
      getTagQueryVarsFn: (id: number) => ({ id: id }),
      getTagQueryResultsFn: (r: ApolloQueryResult<DrugSelectPrepopulateQuery>) =>
        r.data.drug,
      getSelectOptionsFromResultsFn: (
        results: DrugSelectTypeaheadFieldsFragment[],
        tplRefs: QueryList<TemplateRef<any>>,
        mode: 'label' | 'template' = 'label'
      ): NzSelectOptionInterface[] => {
        return results.map(
          (drug: DrugSelectTypeaheadFieldsFragment, index: number) => {
            if (mode === 'label') {
              return <NzSelectOptionInterface>{
                label: drug.name,
                value: drug.id,
              }
            } else {
              return <NzSelectOptionInterface>{
                label: tplRefs.get(index) || drug.name,
                value: drug.id,
              }
            }
          }
        )
      },
      changeDetectorRef: this.changeDetectorRef,
    })
  } // ngAfterViewInit()


  configureStateConnections(): void {
    this.state = this.field.options?.formState
    if (!this.state) return
    if (!this.state.requires.requiresDrug$) {
      console.warn(
        `${this.field.id} field's form provides a state, but could not find requiresDrug$ subject to attach.`
      )
      return
    }
    this.onRequiresDrug$ = this.state.requires.requiresDrug$
    this.onRequiresDrug$
      .pipe(
        untilDestroyed(this)
        // tag(`${this.field.id} onRequiresDrug$`)
      )
      .subscribe((rd) => {
        // this.
      })
  }
}
