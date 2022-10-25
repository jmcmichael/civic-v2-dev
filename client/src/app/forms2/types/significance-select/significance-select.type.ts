import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { CvcInputEnum } from '@app/forms2/forms2.types'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EnumTagField } from '@app/forms2/mixins/enum-tag-field.mixin'
import { EntityClinicalSignificance } from '@app/forms2/states/entity.state'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, map } from 'rxjs'
import mixin from 'ts-mixin-extended'

export type CvcSignificanceSelectFieldOptions = Partial<
  FieldTypeConfig<CvcSignificanceSelectFieldProps>
>

interface CvcSignificanceSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  requireTypePrompt: string
}

export interface CvcSignificanceSelectFieldConfig
  extends FormlyFieldConfig<CvcSignificanceSelectFieldProps> {
  type: 'significance-select' | Type<CvcSignificanceSelectField>
}

const SignificanceSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcSignificanceSelectFieldProps>,
    Maybe<EntityClinicalSignificance>
  >(),
  EnumTagField<EntityClinicalSignificance, CvcInputEnum>()
)

@Component({
  selector: 'cvc-significance-select',
  templateUrl: './significance-select.type.html',
  styleUrls: ['./significance-select.type.less'],
})
export class CvcSignificanceSelectField
  extends SignificanceSelectMixin
  implements AfterViewInit
{
  //TODO: implement more precise types so specific enum-selects like this one can specify their enums, e.g. EntityClinicalSignificance instead of CvcInputEnum
  // STATE SOURCE STREAMS
  significanceEnum$: BehaviorSubject<CvcInputEnum[]>
  onTypeSelect$?: BehaviorSubject<Maybe<CvcInputEnum>>

  // LOCAL SOURCE STREAMS
  onFocus$: BehaviorSubject<void>
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  label$!: BehaviorSubject<string>
  placeholder$!: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcSignificanceSelectFieldOptions = {
    props: {
      label: 'Significance',
      placeholder: 'Select ENTITY_TYPE Clinical Significance',
      requireTypePrompt: 'Select an ENTITY_NAME Type to select Significance',
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(private cdr: ChangeDetectorRef) {
    super()
    this.significanceEnum$ = new BehaviorSubject<CvcInputEnum[]>([])
    this.onFocus$ = new BehaviorSubject<void>(undefined)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEnumTagField({
      optionEnum$: this.significanceEnum$,
      optionTemplate$: this.optionTemplate$,
      changeDetectorRef: this.cdr,
    })
  } // ngAfterViewInit()

  configureStateConnections(): void {
    if (!this.state) {
      console.error(
        `${this.field.id} requires a form state to populate its options, none was found.`
      )
      this.placeholder$ = new BehaviorSubject<string>(
        'ERROR: Form state not found'
      )
      return
    }

    // CONFIGURE PLACEHOLDER PROMPT
    this.props.requireTypePrompt = this.props.requireTypePrompt.replace(
      'ENTITY_NAME',
      this.state.entityName
    )
    this.placeholder$ = new BehaviorSubject<string>(this.props.placeholder)

    // CONFIGURE STATE INPUTS
    // connect to state clinicalSignificanceOptions$
    if (!this.state.enums.clinicalSignificance$) {
      console.error(
        `${this.field.id} could not find form state's enums.clinicalSignificance$ to populate select.`
      )
      return
    }
    // update significance enums when state clinicalSignificance$ emits
    this.state.enums.clinicalSignificance$
      .pipe(untilDestroyed(this))
      .subscribe((enums: CvcInputEnum[]) => {
        this.significanceEnum$.next(enums)
      })

    // set up optionTemplates Observable
    if (!this.optionTemplates) {
      console.error(
        `${this.field.id} could not find its optionTemplates QueryList to populate its select options, so simple text labels will be displayed.`
      )
    }
    this.optionTemplate$ = this.optionTemplates?.changes.pipe(
      // return QueryLists's array of TemplateRefs
      map((ql: QueryList<TemplateRef<any>>) => {
        return ql.map((q) => q)
      })
    )

    // connect to state entityType$
    const etName = `${this.state.entityName.toLowerCase()}Type$`
    if (!this.state.fields[etName]) {
      console.error(
        `${this.field.id} could not find form state's ${etName} to populate Significance options.`
      )
      return
    }
    this.onTypeSelect$ = this.state.fields[etName]
    // if new entityType received, reset field, then based on entityType value, toggle disabled state, update placeholder
    this.onTypeSelect$
      .pipe(untilDestroyed(this))
      .subscribe((et: Maybe<CvcInputEnum>) => {
        this.formControl.setValue(undefined)
        if (!et) {
          this.props.disabled = true
          this.placeholder$.next(this.props.requireTypePrompt)
        } else {
          this.props.disabled = false
          const ph = this.props.placeholder.replace(
            'ENTITY_TYPE',
            et.charAt(0).toUpperCase() + et.slice(1).toLowerCase()
          )
          this.placeholder$.next(ph)
        }
      })
  }
}
