import { AfterViewInit, Component, Injector, Type } from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import {
  EntityClinicalSignificance,
  EntityState,
  SelectOption,
} from '@app/forms2/states/entity.state'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

interface CvcClinicalSignificanceSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  requireTypePrompt: string
}

export interface CvcClinicalSignificanceSelectFieldConfig
  extends FormlyFieldConfig<CvcClinicalSignificanceSelectFieldProps> {
  type:
    | 'clinical-significance-select'
    | Type<CvcClinicalSignificanceSelectField>
}

const ClinicalSignificanceSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>,
    Maybe<EntityClinicalSignificance>
  >()
)

@Component({
  selector: 'cvc-clinical-significance-select',
  templateUrl: './clinical-significance-select.type.html',
  styleUrls: ['./clinical-significance-select.type.less'],
})
export class CvcClinicalSignificanceSelectField
  extends ClinicalSignificanceSelectMixin
  implements AfterViewInit
{
  state: Maybe<EntityState>

  // STATE SOURCE STREAMS
  onEntityType$!: Subject<Maybe<EntityType>>
  selectOption$!: BehaviorSubject<Maybe<SelectOption[]>>

  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<EntityClinicalSignificance>>

  // FieldTypeConfig defaults
  defaultOptions: Partial<
    FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>
  > = {
    props: {
      label: 'Clinical Significance',
      placeholder: 'Select a Clinical Significance',
      requireTypePrompt: 'Select an ENTITY_NAME Type to select Significance',
    },
  }
  constructor(injector: Injector) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureInitialValueHandler() // local fn
  } // ngAfterViewInit()

  configureStateConnections(): void {
    this.state = this.field.options?.formState
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
    this.placeholder$ = new BehaviorSubject<string>(
      this.props.requireTypePrompt
    )

    // CONFIGURE STATE INPUTS
    // connect to state clinicalSignificanceOptions$
    if (!this.state.options.clinicalSignificanceOption$) {
      console.error(
        `${this.field.id} could not find form state's clinicalSignificanceOption$ to populate select.`
      )
      return
    }
    this.selectOption$ = this.state.options.clinicalSignificanceOption$

    // connect to state entityType$
    const etName = `${this.state.entityName.toLowerCase()}Type$`
    if (!this.state.fields[etName]) {
      console.error(
        `${this.field.id} could not find form state's ${etName} to populate select.`
      )
      return
    }
    this.onEntityType$ = this.state.fields[etName]

    this.onEntityType$
      .pipe(untilDestroyed(this))
      .subscribe((et: Maybe<EntityType>) => {
        if (!et) {
          this.placeholder$.next(this.props.requireTypePrompt)
        } else {
          this.placeholder$.next(this.props.placeholder)
        }
      })

    // CONFIGURE STATE OUTPUT
    this.stateValueChange$ = this.state.fields.clinicalSignificance$
    if (!this.stateValueChange$) {
      console.warn(
        `${this.field.id} could not find state field's clinicalSignifince$ to emit its value changes.`
      )
      return
    }
    this.onValueChange$
      .pipe(
        // tag('clinical-significance-select clinicalSignificanceChange$'),
        untilDestroyed(this)
      )
      .subscribe((v) => {
        if (this.stateValueChange$) this.stateValueChange$.next(v)
      })
  }
  private configureInitialValueHandler(): void {
    // if on initialization, this field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state, model initialization), emit
    // onValueChange$, state valueChange$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
      // valueChange$ may not exist if component is a repeat-item or form state missing
      if (!this.stateValueChange$) return
      this.stateValueChange$.next(v)
    }
  }
}
