import { AfterViewInit, Component, Injector, Type } from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import {
  EntityClinicalSignificance,
  EntityState,
  SelectOption,
} from '@app/forms2/states/entity.state'
import {
  EvidenceClinicalSignificance,
  EvidenceType,
  Maybe,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

interface CvcClinicalSignificanceSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  requireType: true
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

@UntilDestroy()
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
  onEvidenceType$!: Subject<Maybe<EntityType>>

  // LOCAL SOURCE STREAMS

  // PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<Maybe<SelectOption[]>>
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  clinicalSignificanceChange$?: BehaviorSubject<
    Maybe<EntityClinicalSignificance>
  >

  // FieldTypeConfig defaults
  defaultOptions: Partial<
    FieldTypeConfig<CvcClinicalSignificanceSelectFieldProps>
  > = {
    props: {
      label: 'Clinical Significance',
      placeholder: 'Select a Clinical Significance',
      requireType: true,
      requireTypePrompt: 'Select an Evidence Type to select Significance',
    },
  }
  constructor(injector: Injector) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateListeners() // local fn

    // show prompt to select a Type if requireType true
    // otherwise show standard placeholder
    const initialPlaceholder: string = this.props.requireType
      ? this.props.requireTypePrompt
      : this.props.placeholder
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

    // set up input & output streams,
    if (this.field?.options?.formState) {
      // set up output stream
      if (this.state && this.state.fields.clinicalSignificance$) {
        this.clinicalSignificanceChange$ =
          this.state.fields.clinicalSignificance$
        this.onValueChange$
          .pipe(
            // tag('clinical-significance-select clinicalSignificanceChange$'),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.clinicalSignificanceChange$)
              this.clinicalSignificanceChange$.next(v)
          })
      }
    }
  } // ngAfterViewInit()

  configureStateListeners(): void {
    if (!this.field?.options?.formState) {
      console.error(
        `${this.field.id} requires a form state to populate its options, none was found.`
      )
      this.placeholder$ = new BehaviorSubject<string>(
        'ERROR: Form state not found'
      )
      return
    }
    this.state = this.field.options.formState
    // set up input streams
    if (this.state && this.state.options.clinicalSignificanceOption$) {
      this.selectOption$ = this.state.options.clinicalSignificanceOption$
    } else {
      console.error(
        `${this.field.id} could not find form state's clinicalSignificanceOption$ to populate select.`
      )
    }

    if (this.state && this.state.fields.evidenceType$) {
      this.onEvidenceType$ = this.state.fields.evidenceType$
      this.onEvidenceType$
        .pipe(untilDestroyed(this))
        .subscribe((et: Maybe<EntityType>) => {
          if (!et && this.props.requireType) {
            this.placeholder$.next(this.props.requireTypePrompt)
          } else {
            this.placeholder$.next(this.props.placeholder)
          }
        })
    } else {
      console.error(
        `clinical-significance-select field could not find form state's evidenceType$.`
      )
    }
  }
}
