import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    QueryList,
    TemplateRef,
    Type,
    ViewChildren
} from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { CvcInputEnum } from '@app/forms2/forms2.types'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EnumTagField } from '@app/forms2/mixins/enum-tag-field.mixin'
import { CvcFieldLayoutWrapperConfig } from '@app/forms2/wrappers/form-field/form-field.wrapper'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
    FieldTypeConfig,
    FormlyFieldConfig,
    FormlyFieldProps
} from '@ngx-formly/core'
import { BehaviorSubject, map } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export type CvcEntityTypeSelectFieldOptions = Partial<
  FieldTypeConfig<CvcEntityTypeSelectFieldProps>
>

interface CvcEntityTypeSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  enumName: string
  isMultiSelect: boolean
  layout?: CvcFieldLayoutWrapperConfig
}

export interface CvcEntityTypeSelectFieldConfig
  extends FormlyFieldConfig<CvcEntityTypeSelectFieldProps> {
  type: 'type-select' | Type<CvcEntityTypeSelectField>
}

const EntityTypeSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcEntityTypeSelectFieldProps>,
    Maybe<EntityType>
  >(),
  EnumTagField<EntityType, CvcInputEnum>()
)

@Component({
  selector: 'cvc-type-select',
  templateUrl: './type-select.type.html',
  styleUrls: ['./type-select.type.less'],
})
export class CvcEntityTypeSelectField
  extends EntityTypeSelectMixin
  implements AfterViewInit
{
  //TODO: implement more precise types so specific enum-selects like this one can specify their enums, e.g. EntityType instead of CvcInputEnum
  // STATE SOURCE STREAMS
  typeEnums$!: BehaviorSubject<CvcInputEnum[]>

  // LOCAL SOURCE STREAMS
  onFocus$: BehaviorSubject<void>

  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  label$!: BehaviorSubject<string>
  placeholder$!: BehaviorSubject<string>

  defaultOptions: Partial<FieldTypeConfig<CvcEntityTypeSelectFieldProps>> = {
    props: {
      label: 'ENTITY_NAME Type',
      placeholder: 'Select an ENTITY_NAME Type',
      enumName: 'Type',
      isMultiSelect: false,
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(private cdr: ChangeDetectorRef) {
    super()
    this.typeEnums$ = new BehaviorSubject<CvcInputEnum[]>([])
    this.onFocus$ = new BehaviorSubject<void>(undefined)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEnumTagField({
      optionEnum$: this.typeEnums$,
      optionTemplate$: this.optionTemplate$,
      changeDetectorRef: this.cdr,
    })
  }

  configureStateConnections(): void {
    if (!this.state) {
      console.error(
        `${this.field.id} requires a form state to configure itself, none was found.`
      )
      return
    }

    // set placeholder & label w/ proper entity name
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

    // subscribe to state's type options
    if (!this.state.enums.entityType$) {
      console.error(
        `${this.field.id} could not find state's enums.inputEnum$ to populate its select options.`
      )
      return
    }

    // update type enums when state entityType$ emits
    this.state.enums.entityType$
      .pipe(untilDestroyed(this))
      .subscribe((enums: CvcInputEnum[]) => {
        this.typeEnums$.next(enums)
      })

    // check if option templates exist
    if (!this.optionTemplates) {
      console.error(
        `${this.field.id} could not find its optionTemplates QueryList to populate its select options, so simple text labels will be displayed.`
      )
    }
    this.optionTemplate$ = this.optionTemplates?.changes.pipe(
      tag(`${this.field.id} optionTemplate$`),
      // return QueryLists's array of TemplateRefs
      map((ql: QueryList<TemplateRef<any>>) => {
        return ql.map((q) => q)
      })
    )
  }
}
