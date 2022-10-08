import { AfterViewInit, Component, Injector, OnInit, Type } from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base-DEPRECATED'
import { EntityState, SelectOption } from '@app/forms2/states/entity.state'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { Maybe } from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs'
import { pluck } from 'rxjs-etc/operators'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

interface CvcEntityTypeSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
}

export interface CvcEntityTypeSelectFieldConfig
  extends FormlyFieldConfig<CvcEntityTypeSelectFieldProps> {
  type: 'entity-type-select' | Type<CvcEntityTypeSelectField>
}

const EntityTypeSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcEntityTypeSelectFieldProps>,
    Maybe<EntityType>
  >()
)

@Component({
  selector: 'cvc-entity-type-select',
  templateUrl: './entity-type-select.type.html',
  styleUrls: ['./entity-type-select.type.less'],
})
export class CvcEntityTypeSelectField
  extends EntityTypeSelectMixin
  implements AfterViewInit
{
  state: Maybe<EntityState>

  // STATE SOURCE STREAMS
  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<SelectOption[]>
  label$!: BehaviorSubject<string>
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<EntityType>>

  defaultOptions: Partial<FieldTypeConfig<CvcEntityTypeSelectFieldProps>> = {
    props: {
      label: 'ENTITY_NAME Type',
      placeholder: 'Select an ENTITY_NAME Type',
    },
  }

  constructor(injector: Injector) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureInitialValueHandler() // local fn
  } // ngAfterViewInit

  configureStateConnections(): void {
    this.state = this.field.options?.formState
    if (!this.state) {
      console.error(
        `${this.field.id} requires a form state to configure itself, none was found.`
      )
      this.placeholder$ = new BehaviorSubject<string>(
        'ERROR: Form state not found'
      )
      return
    }

    // CONFIGURE LABEL, PLACEHOLDER PROMPT
    this.props.placeholder = this.props.placeholder.replace(
      'ENTITY_NAME',
      this.state.entityName
    )
    this.placeholder$ = new BehaviorSubject<string>(this.props.placeholder)
    this.props.label = this.props.label.replace(
      'ENTITY_NAME',
      this.state.entityName
    )
    this.label$ = new BehaviorSubject<string>(this.props.label)

    // CONFIGURE STATE INPUTS
    const etoName = `${this.state.entityName.toLowerCase()}TypeOption$`
    this.selectOption$ = this.state.options[etoName]
    if (!this.selectOption$) {
      console.error(
        `${this.field.id} could not find state's ${etoName} to populate select options.`
      )
      return
    }

    // CONFIGURE STATE OUTPUT
    const etName = `${this.state.entityName.toLowerCase()}Type$`
    this.stateValueChange$ = this.state.fields[etName]
    if (!this.stateValueChange$) {
      console.warn(
        `${this.field.id} could not find state's ${etName} to emit its value changes.`
      )
      return
    }
    this.onValueChange$
      .pipe(
        // tag('entity-significance-select clinicalSignificanceChange$'),
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
