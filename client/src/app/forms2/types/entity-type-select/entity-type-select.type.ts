import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { EntityType } from '@app/forms/config/states/entity.state'
import { CvcInputEnum } from '@app/forms2/forms2.types'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EnumTagField } from '@app/forms2/mixins/enum-tag-field.mixin'
import { Maybe } from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject, withLatestFrom } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

interface CvcEntityTypeSelectFieldProps extends FormlyFieldProps {
  label: string
  placeholder: string
  enumName: string
  isMultiSelect: boolean
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
  typeEnums$!: BehaviorSubject<CvcInputEnum[]>

  // LOCAL SOURCE STREAMS
  onFocus$: BehaviorSubject<void>
  onTagClose$: Subject<MouseEvent>
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
      enumName: 'Type',
      isMultiSelect: false,
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(private cdr: ChangeDetectorRef) {
    super()
    this.selectOption$ = new BehaviorSubject<NzSelectOptionInterface[]>([])
    this.typeEnums$ = new BehaviorSubject<CvcInputEnum[]>([])
    this.onFocus$ = new BehaviorSubject<void>(undefined)
    this.onTagClose$ = new Subject<MouseEvent>()
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
  }

  configureStateConnections(): void {
    this.stateValueChange$!.pipe(
      tag(`${this.field.id} stateValueChange$`)
    ).subscribe()
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

    // check it option templates exist
    // if not, populate selectOption$ with simple label/value options and exit
    if (!this.optionTemplates) {
      console.error(
        `${this.field.id} could not find its optionTemplates QueryList to populate its select options, so simple text labels will be displayed.`
      )
      this.selectOption$.next(
        this.state.getOptionsFromEnums(this.state.getTypeOptions())
      )
      return
    }
    // listen to option template updates & create selectOptions w/
    // enums & template array
    this.optionTemplates.changes
      .pipe(
        withLatestFrom(this.typeEnums$),
        tag(`${this.field.id} optionTemplates.changes`),
        untilDestroyed(this)
      )
      .subscribe(
        ([tplRefs, enums]: [QueryList<TemplateRef<any>>, CvcInputEnum[]]) => {
          this.updateSelectOptionsFn(tplRefs, enums)
        }
      )

    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_) => {
      this.resetField()
    })
  }

  updateSelectOptionsFn(
    tplRefs: QueryList<TemplateRef<any>>,
    enums: CvcInputEnum[]
  ): void {
    const options = this.getOptionsFromEnums(enums, tplRefs)
    this.selectOption$.next(options)
    // this.cdr.detectChanges()
  }

  getOptionsFromEnums(
    inputEnums: CvcInputEnum[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return inputEnums.map((inputEnum: CvcInputEnum, index: number) => {
      return <NzSelectOptionInterface>{
        label: tplRefs.get(index) || inputEnum,
        value: inputEnum,
      }
    })
  }

  resetField() {
    if (this.props.isMultiSelect) {
      this.formControl.setValue([])
    } else {
      this.formControl.setValue(undefined)
    }
    // reset options to prevent brief flash of previous
    // search (or prepopulate) option items during subsequent searches
    // if (this.selectOption$) this.selectOption$.next([])
    // reset results to empty out optionTemplate QueryList, forcing
    // re-render of optionTemplates for subsequent search results, even
    // if cached results are returned
    // if (this.typeEnums$) this.typeEnums$.next([])
  }
}
