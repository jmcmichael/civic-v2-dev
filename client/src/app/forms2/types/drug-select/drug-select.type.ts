import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import {
  CvcSelectEntityName,
  CvcSelectMessageOptions,
} from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
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
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { QueryRef } from 'apollo-angular'
import { BehaviorSubject, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcDrugSelectFieldProps extends FormlyFieldProps {
  isRepeatItem: boolean // is child of a repeat-field type
  entityName: CvcSelectEntityName
  selectMessages: CvcSelectMessageOptions
  placeholder: string // default placeholder
}

export interface CvcDrugSelectFieldConfig
  extends FormlyFieldConfig<CvcDrugSelectFieldProps> {
  type: 'drug-select' | 'drug-select-item' | Type<CvcDrugSelectField>
}

const DrugSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcDrugSelectFieldProps>, Maybe<number>>(),
  EntityTagField<
    DrugSelectTypeaheadQuery,
    DrugSelectTypeaheadQueryVariables,
    DrugSelectTypeaheadFieldsFragment,
    LinkableDrugQuery,
    LinkableDrugQueryVariables,
    Drug,
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

  // LOCAL SOURCE STREAMS

  // LOCAL PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>
  constructor(
    public injector: Injector,
    private taq: DrugSelectTypeaheadGQL,
    private tq: LinkableDrugGQL
  ) {
    super(injector)
  }

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcDrugSelectFieldProps>> = {
    props: {
      label: 'Drug',
      placeholder: 'Search Drugs',
      isRepeatItem: false,
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

    this.configureEntityTagField(
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
      (r: ApolloQueryResult<DrugSelectTypeaheadQuery>) =>
        r.data.drugTypeahead,
      // linkable entity query vars getter fn
      (id: number) => ({ drugId: id }),
      // tag cache id getter fn
      (r: ApolloQueryResult<LinkableDrugQuery>) => `Drug:${r.data.drug!.id}`,
      // no optional typeahead parameter
      undefined
    )

    // set initial placeholder & subject
    // TODO: implement 'requiresEvidence/Assertion Type' option that will display a
    // "Choose Evidence / Assertion Type before selection Drug(s)" placeholder
    this.placeholder$ = new BehaviorSubject<string>(this.props.placeholder)

  }
}
