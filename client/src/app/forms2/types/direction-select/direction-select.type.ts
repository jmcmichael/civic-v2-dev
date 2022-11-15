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
import { EntityDirection } from '@app/forms2/states/entity.state'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { BehaviorSubject, map, withLatestFrom } from 'rxjs'
import mixin from 'ts-mixin-extended'

const optionText: any = {
  Evidence: {
    PREDICTIVE: {
      SUPPORTS:
        "The experiment or study supports this variant's response to a drug",
      DOES_NOT_SUPPORT:
        'The experiment or study does not support, or was inconclusive of an interaction between this variant and a drug',
    },
    DIAGNOSTIC: {
      SUPPORTS:
        "The experiment or study supports this variant's impact on the diagnosis of disease or subtype",
      DOES_NOT_SUPPORT:
        "The experiment or study does not support this variant's impact on diagnosis of disease or subtype",
    },
    PROGNOSTIC: {
      SUPPORTS:
        "The experiment or study supports this variant's impact on prognostic outcome",
      DOES_NOT_SUPPORT:
        'The experiment or study does not support a prognostic association between variant and outcome',
    },
    PREDISPOSING: {
      SUPPORTS:
        'The evidence suggests a pathogenic or a protective role for a germline variant in cancer',
      DOES_NOT_SUPPORT:
        'The evidence supports a benign (for Predisposition) or lack of protective (for Protectiveness) role for a germline variant in cancer.',
    },
    FUNCTIONAL: {
      SUPPORTS:
        'The experiment or study supports this variant causing alteration or non-alteration of the gene product function',
      DOES_NOT_SUPPORT:
        'The experiment or study does not support this variant causing alteration or non-alteration of the gene product function',
    },
    ONCOGENIC: {
      NA: 'Evidence Direction is Not Applicable for Oncogenic Evidence Type.',
      SUPPORTS:
        'The evidence supports an oncogenic or protective role for a somatic variant.',
      DOES_NOT_SUPPORT:
        'The evidence supports a benign (for Oncogenicity) or lack of protective (for Protectiveness) role for a somatic variant in cancer.',
    },
  },
  Assertion: {
    PREDICTIVE: {
      SUPPORTS:
        "The Assertion and associated Evidence Items support this variant's response to a drug",
      DOES_NOT_SUPPORT:
        'The Assertion and associated evidence does not support, or was inconclusive of an interaction between this variant and a drug',
    },
    DIAGNOSTIC: {
      SUPPORTS:
        "The Assertion and associated Evidence Items support this variant's impact on the diagnosis of disease or subtype",
      DOES_NOT_SUPPORT:
        "The Assertion and associated evidence does not support this variant's impact on diagnosis of disease or subtype",
    },
    PROGNOSTIC: {
      SUPPORTS:
        "The Assertion and associated Evidence Items support this variant's impact on prognostic outcome",
      DOES_NOT_SUPPORT:
        'The Assertion and associated evidence does not support a prognostic association between variant and outcome',
    },
    PREDISPOSING: {
      SUPPORTS:
        'The Assertion suggests a pathogenic or a protective role for a germline variant in cancer',
      DOES_NOT_SUPPORT:
        'The Assertion does not support an association between the variant and disease causation.',
    },
    FUNCTIONAL: {
      SUPPORTS:
        'The Assertion and associated Evidence Items support this variant causing alteration or non-alteration of the gene product function',
      DOES_NOT_SUPPORT:
        'The Assertion and associated evidence does not support this variant causing alteration or non-alteration of the gene product function',
    },
    ONCOGENIC: {
      SUPPORTS:
        'The Assertion supports an oncogenic or protective role for a somatic variant.',
      DOES_NOT_SUPPORT:
        'The Assertion does not support an association between the variant and disease causation.',
    },
  },
}

export type CvcDirectionSelectFieldOptions = Partial<
  FieldTypeConfig<CvcDirectionSelectFieldProps>
>

interface CvcDirectionSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  requireTypePrompt: string
  enumName: string
  isMultiSelect: boolean
  description?: string
  tooltip?: string
}

export interface CvcDirectionSelectFieldConfig
  extends FormlyFieldConfig<CvcDirectionSelectFieldProps> {
  type: 'direction-select' | Type<CvcDirectionSelectField>
}

const DirectionSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcDirectionSelectFieldProps>,
    Maybe<EntityDirection>
  >(),
  EnumTagField<EntityDirection, CvcInputEnum>()
)

@Component({
  selector: 'cvc-direction-select',
  templateUrl: './direction-select.type.html',
  styleUrls: ['./direction-select.type.less'],
})
export class CvcDirectionSelectField
  extends DirectionSelectMixin
  implements AfterViewInit
{
  //TODO: implement more precise types so specific enum-selects like this one can specify their enums, e.g. EntityDirection instead of CvcInputEnum
  // STATE SOURCE STREAMS
  directionEnum$: BehaviorSubject<CvcInputEnum[]>
  onTypeSelect$?: BehaviorSubject<Maybe<CvcInputEnum>>

  // LOCAL SOURCE STREAMS
  onFocus$: BehaviorSubject<void>
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  label$!: BehaviorSubject<string>
  placeholder$!: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcDirectionSelectFieldOptions = {
    props: {
      label: 'Evidence Direction',
      enumName: 'Direction',
      required: true,
      isMultiSelect: false,
      placeholder: 'Select ENTITY_TYPE Direction',
      requireTypePrompt: 'Select an ENTITY_NAME Type to select Direction',
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(private cdr: ChangeDetectorRef) {
    super()
    this.directionEnum$ = new BehaviorSubject<CvcInputEnum[]>([])
    this.onFocus$ = new BehaviorSubject<void>(undefined)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEnumTagField({
      optionEnum$: this.directionEnum$,
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

    this.props.tooltip = `An indicator of whether the ${this.state.entityName} statement supports or refutes the clinical significance of an event.`

    // CONFIGURE PLACEHOLDER PROMPT
    this.props.requireTypePrompt = this.props.requireTypePrompt.replace(
      'ENTITY_NAME',
      this.state.entityName
    )
    this.placeholder$ = new BehaviorSubject<string>(this.props.placeholder)

    // CONFIGURE STATE INPUTS
    // connect to state directionOptions$
    if (!this.state.enums.direction$) {
      console.error(
        `${this.field.id} could not find form state's direction$ to populate select.`
      )
      return
    }
    // update direction enums when state direction$ emits
    this.state.enums.direction$
      .pipe(untilDestroyed(this))
      .subscribe((enums: CvcInputEnum[]) => {
        this.directionEnum$.next(enums)
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
        `${this.field.id} could not find form state's ${etName} to populate Direction options.`
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

    this.onValueChange$
      .pipe(withLatestFrom(this.onTypeSelect$), untilDestroyed(this))
      .subscribe(([ed, et]: [Maybe<CvcInputEnum>,  Maybe<CvcInputEnum>]) => {
        if (!et || !ed || !this.state) return
        console.log(`evidence type: ${et}, evidence direction: ${ed}`)
        this.props.description = optionText[this.state.entityName][et][ed]
      })
  }
}
