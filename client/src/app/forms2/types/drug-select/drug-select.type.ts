import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Type,
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
  LinkableDrugQuery,
  LinkableDrugQueryVariables,
  DrugSelectTypeaheadFieldsFragment,
  DrugSelectTypeaheadGQL,
  DrugSelectTypeaheadQuery,
  DrugSelectTypeaheadQueryVariables,
  LinkableDrugGQL,
  Maybe,
  Drug,
  DrugSelectPrepopulateQuery,
  DrugSelectPrepopulateGQL,
  DrugSelectPrepopulateQueryVariables,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { QueryRef } from 'apollo-angular'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, map, Observable, Subject, switchMap } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcDrugSelectFieldProps extends FormlyFieldProps {
  isMultiSelect: boolean // is child of a repeat-field type
  entityName: CvcSelectEntityName
  selectMessages: CvcSelectMessageOptions
  placeholder: string // default placeholder
}

export interface CvcDrugSelectFieldConfig
  extends FormlyFieldConfig<CvcDrugSelectFieldProps> {
  type: 'drug-select' | 'drug-select-multi' | Type<CvcDrugSelectField>
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
  onCreate$: Subject<number>

  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>
  constructor(
    public injector: Injector,
    private taq: DrugSelectTypeaheadGQL,
    private tq: DrugSelectPrepopulateGQL
  ) {
    super(injector)
    this.onRequiresDrug$ = new BehaviorSubject<boolean>(true)
    this.onCreate$ = new Subject<number>()
    this.selectOption$ = new BehaviorSubject<NzSelectOptionInterface[]>([])

    // export interface NzSelectOptionInterface {
    //   label: string | number | null | TemplateRef<NzSafeAny>;
    //   value: NzSafeAny | null;
    //   disabled?: boolean;
    //   hide?: boolean;
    //   groupLabel?: string | number | TemplateRef<NzSafeAny> | null;
    // }
  }

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcDrugSelectFieldProps>> = {
    props: {
      label: 'Drug',
      placeholder: 'Search Drugs',
      isMultiSelect: false,
      entityName: { singular: 'Drug', plural: 'Drugs' },
      selectMessages: {
        focus: 'Enter query to search',
        loading: 'Searching Drugs',
        notfound: 'No Drugs found matching "SEARCH_STRING"',
        create: 'No Drugs found matching "SEARCH_STRING", create a new one?',
      },
    },
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections()
    this.configureEntityTagField(
      // mixin fn
      // mixin fn
      // typeahead query
      this.taq,
      // linkable entity query
      this.tq,
      // typeahead query vars getter fn
      (str: string) => ({
        name: str,
      }),
      // typeahead query result map fn
      (r: ApolloQueryResult<DrugSelectTypeaheadQuery>) => r.data.drugTypeahead,
      // linkable entity query vars getter fn
      // TODO: Probably can remove this parameter
      (id: number) => ({ id: id }),
      // tag cache id getter fn
      (r: ApolloQueryResult<LinkableDrugQuery>) => `Drug:${r.data.drug!.id}`,
      // no optional typeahead parameter
      undefined
    )

    // set initial placeholder & subject
    this.placeholder$ = new BehaviorSubject<string>(this.props.placeholder)

    this.result$
      .pipe(untilDestroyed(this))
      .subscribe((r: DrugSelectTypeaheadFieldsFragment[]) => {
        this.selectOption$.next(r.map((d) => ({ label: d.name, value: d.id })))
      })

    this.onCreate$.pipe(untilDestroyed(this)).subscribe((id: number) => {
      console.log(`${this.field.id} onCreate$ called; id: ${id}`)
      if (this.props.isMultiSelect) {
        console.log('is multiSelect')
      } else {
        console.log('is not multiSelect')
      }
    })

    if (this.formControl.value) {
    }
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
      .pipe(untilDestroyed(this), tag(`${this.field.id} onRequiresDrug$`))
      .subscribe((rd) => {
        // this.
      })
  }
}
