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
import {
  BehaviorSubject,
  filter,
  from,
  map,
  Observable,
  of,
  Subject,
  switchMap,
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
  onCreate$: Subject<Drug>

  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>
  constructor(
    public injector: Injector,
    private taq: DrugSelectTypeaheadGQL,
    private tq: DrugSelectPrepopulateGQL,
    private cdr: ChangeDetectorRef
  ) {
    super(injector)
    this.onRequiresDrug$ = new BehaviorSubject<boolean>(true)
    this.onCreate$ = new Subject<Drug>()
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
      isMultiSelect: false,
      entityName: { singular: 'Drug', plural: 'Drugs' },
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
      // linkable entity query TODO: probably can remove
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

    // emit select options whenever results are returned from query
    this.result$
      .pipe(untilDestroyed(this))
      .subscribe((r: DrugSelectTypeaheadFieldsFragment[]) => {
        this.selectOption$.next(r.map((d) => ({ label: d.name, value: d.id })))
      })

    this.onCreate$.pipe(untilDestroyed(this)).subscribe((drug: Drug) => {
      console.log(`${this.field.id} onCreate$ called: ${drug}`)
      this.selectOption$.next([{ label: drug.name, value: drug.id }])
      if (this.props.isMultiSelect) {
        console.log('is multiSelect')
      } else {
        console.log('is not multiSelect')
      }
    })

    // if a prepopulated form value exists, set by the observe-query-param extension,
    // use tagQuery to create select option(s) for it so that nz-select's tags render
    if (this.formControl.value) {
      const v = this.formControl.value
      if (Object.keys(v).length > 0 && v.constructor === Object) {
        console.error(
          `${this.field.id} prepopulated value must be a primitive or array of primitives, value is an object:`,
          v
        )
        return
      }
      let queries: Observable<DrugSelectPrepopulateQuery>[]
      // wrap primitives in array
      if (typeof v === 'number') {
        queries = this.getFetchFn([v])
      } else {
        queries = this.getFetchFn(v)
      }
      combineLatestArray(queries)
        .pipe(
          tag(`${this.field.id} combineLatestArray(queries)`),
          map((data) => {
            if (!(data.length > 0)) return []
            if (!data.every(({ drug }) => drug !== undefined)) return []
            return data.map(({ drug }) => {
              const d = drug as DrugSelectTypeaheadFieldsFragment
              return {
                label: d.name,
                value: d.id,
              }
            })
          })
        )
        .subscribe((options) => {
          if (!options || !options.every((o) => typeof o !== 'undefined')) {
            console.error(
              `${this.field.id} prepopulate select options error: one or more option requests failed.`,
              options
            )
          }
          this.selectOption$.next(options)
        })
    }
  } // ngAfterViewInit()

  getFetchFn(ids: number[]): Observable<DrugSelectPrepopulateQuery>[] {
    const queries = ids.map((id) =>
      this.tq
        .fetch({ id: id }, { fetchPolicy: 'cache-first' })
        .pipe(
          tag(`${this.field.id} tag query fetch`),
          pluck('data'),
          filter(isNonNulled)
        )
    )
    console.log(queries)
    return queries
  }

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
