import { AfterViewInit, Component, Type } from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EnumTagField } from '@app/forms2/mixins/enum-tag-field.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import {
    FieldTypeConfig,
    FormlyFieldConfig,
    FormlyFieldProps
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject } from 'rxjs'
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
  >(),
  EnumTagField<EntityType>()
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

  // STATE SOURCE STREAMS
  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>
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

  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
  }

  configureStateConnections(): void {
    this.stateValueChange$!.pipe(tag(`${this.field.id} stateValueChange$`)).subscribe()
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
    const etoName = `${this.state.entityName.toLowerCase()}TypeOption$`
    this.selectOption$ = this.state.options[etoName]
    if (!this.selectOption$) {
      console.error(
        `${this.field.id} could not find state's ${etoName} to populate select options.`
      )
      return
    }

  }

}
