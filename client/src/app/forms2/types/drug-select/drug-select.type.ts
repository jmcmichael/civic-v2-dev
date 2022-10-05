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
  state?: EntityState

  // STATE SOURCE STREAMS
  onRequiresDrug$: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS
  onDrugCreate$: Subject<number>

  // LOCAL PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>

  queryRef!: QueryRef<
    DrugSelectTypeaheadQuery,
    DrugSelectTypeaheadQueryVariables
  >

  constructor(
    public injector: Injector,
    private taq: DrugSelectTypeaheadGQL,
    private tq: LinkableDrugGQL
  ) {
    super(injector)
    this.onRequiresDrug$ = new BehaviorSubject<boolean>(true)
    this.onDrugCreate$ = new Subject<number>()
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
    this.configureStateConnections() // local fn

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

    // if field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state,
    // model initialization), emit onValueChange$, state valueChange$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
    }

    // emit value change if new variant created by quick-add form
    this.onDrugCreate$.pipe(untilDestroyed(this)).subscribe(v => {
      this.onValueChange$.next(v)
    })
  }

  configureStateConnections(): void {
    // do not attach state connections if field is a repeat-item
    if(this.props.isRepeatItem) return
    if (!this.field.options?.formState) {
      console.warn(
        `${this.field.id} is not a repeat-item, but no formState found.`
      )
      return
    }
    this.state = this.field.options.formState
    if (!this.state?.requires.requiresDrug$) {
      console.warn(
        `${this.field.id} is not a repeat-item, but no requiresDrug$ subject found on state.`
      )
      return
    }
    this.onRequiresDrug$ = this.state.requires.requiresDrug$
    this.onRequiresDrug$.pipe(untilDestroyed(this), tag(
      `${this.field.id} onRequiresDrug$`
    )).subscribe((rd) => {
      // this.
    })
  }
}
