import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    QueryList,
    TemplateRef,
    Type,
    ViewChildren
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { CvcSelectEntityName } from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EntityType } from '@app/forms2/states/entity.state'
import {
    Maybe, SourceSelectTagGQL,
    SourceSelectTagQuery,
    SourceSelectTagQueryVariables,
    SourceSelectTypeaheadFieldsFragment,
    SourceSelectTypeaheadGQL,
    SourceSelectTypeaheadQuery,
    SourceSelectTypeaheadQueryVariables, SourceSource
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
    FieldTypeConfig,
    FormlyFieldConfig,
    FormlyFieldProps
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, combineLatest, Subject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export type CvcSourceSelectFieldOptions = Partial<
  FieldTypeConfig<CvcSourceSelectFieldProps>
>
// TODO: finish implementing updated props interface w/ labels, placeholders groups,
// and multiMax limits, multiDefault placeholder
export interface CvcSourceSelectFieldProps extends FormlyFieldProps {
  // entity names, singular & plural
  entityName: CvcSelectEntityName
  // if true, field is a multi-select & its model value should be an array
  isMultiSelect: boolean
  // if true, field disabled when no entity type available
  requireType: boolean
  labels: {
    // label if a multi type, showing optional plurality, e.g. 'Variant(s)'
    multi: string
    // label if multi type & model value length > 1
    plural: string
  }
  placeholders: {
    // default placeholder
    default: string
    // default placeholder for multi-selects
    multiDefault: string
    // placeholder if evidence/assertion type required & field disabled
    requireTypePrompt: string
  }
  tooltip?: string
  description?: string
}

// NOTE: any multi-select field must have the string 'multi' in its type name,
// as UI logic (currently in base-field) depends on its presence to differentiate
// field types in some expressions
export interface CvcSourceSelectFieldConfig
  extends FormlyFieldConfig<CvcSourceSelectFieldProps> {
  type: 'source-select' | 'source-multi-select' | Type<CvcSourceSelectField>
}

const SourceSelectMixin = mixin(
  BaseFieldType<
    FieldTypeConfig<CvcSourceSelectFieldProps>,
    Maybe<number | number[]>
  >(),
  EntityTagField<
    SourceSelectTypeaheadQuery,
    SourceSelectTypeaheadQueryVariables,
    SourceSelectTypeaheadFieldsFragment,
    SourceSelectTagQuery,
    SourceSelectTagQueryVariables,
    Maybe<number | number[]>
  >()
)

@Component({
  selector: 'cvc-source-select',
  templateUrl: './source-select.type.html',
  styleUrls: ['./source-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcSourceSelectField
  extends SourceSelectMixin
  implements AfterViewInit
{
  // STATE SOURCE STREAMS
  onEntityType$?: Subject<Maybe<EntityType>>
  onRequiresSource$?: BehaviorSubject<boolean>

  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  placeholder$: BehaviorSubject<string>

  // FieldTypeConfig defaults
  defaultOptions: CvcSourceSelectFieldOptions = {
    props: {
      entityName: { singular: 'Source', plural: 'Sources' },
      label: 'Source',
      labels: {
        multi: 'Source(s)',
        plural: 'Sources',
      },
      isMultiSelect: false,
      requireType: true,
      tooltip:
        'Source or source combination which interacts with the specified variant',
      // TODO: implement labels/placeholders w/ string replacement using typescript
      // template strings: https://www.codevscolor.com/typescript-template-string
      placeholders: {
        default: 'Search Sources',
        multiDefault: 'Select Source(s) (max MULTI_MAX)',
        requireTypePrompt: 'Select an ENTITY_NAME Type to search Sources',
      },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  stateEntityName?: string

  constructor(
    private taq: SourceSelectTypeaheadGQL,
    private tq: SourceSelectTagGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super()
    this.placeholder$ = new BehaviorSubject<string>(
      this.defaultOptions.props!.placeholders!.default
    )
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEntityTagField({
      // mixin fn
      typeaheadQuery: this.taq,
      typeaheadParam$: undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: this.getTypeaheadVarsFn,
      getTypeaheadResultsFn: this.getTypeaheadResultsFn,
      getTagQueryVarsFn: this.getTagQueryVarsFn,
      getTagQueryResultsFn: this.getTagQueryResultsFn,
      getSelectedItemOptionFn: this.getSelectedItemOptionFn,
      getSelectOptionsFn: this.getSelectOptionsFn,
      changeDetectorRef: this.changeDetectorRef,
    })
    this.configurePlaceholders()
    this.configureLabels()
  } // ngAfterViewInit()

  configureStateConnections(): void {
    if (!this.state) return
    this.stateEntityName = this.state.entityName
    // connect to onRequiresSource$
    if (!this.state.requires.requiresSource$) {
      console.warn(
        `${this.field.id} field's form provides a state, but could not find requiresSource$ subject to attach.`
      )
    } else {
      this.onRequiresSource$ = this.state.requires.requiresSource$
    }

    // connect onEntityType$
    if (this.props.requireType) {
      const etName = `${this.stateEntityName.toLowerCase()}Type$`
      if (!this.state.fields[etName]) {
        console.error(
          `${this.field.id} requireType is true, however form state does not provide Subject ${etName}.`
        )
      } else {
        this.onEntityType$ = this.state.fields[etName]
        // this.onEntityType$.pipe(tag(`${this.field.id} onEntityType$`)).subscribe()
      }
    }
  }

  configurePlaceholders(): void {
    if (!this.onRequiresSource$ || !this.onEntityType$) return
    // update field placeholders & required status on state input events
    combineLatest([this.onRequiresSource$, this.onEntityType$])
      .pipe(tag(`${this.field.id} combineLatest`), untilDestroyed(this))
      .subscribe(
        ([requiresSource, entityType]: [boolean, Maybe<EntityType>]) => {
          // sources are not associated with this entity type
          if (!requiresSource && entityType) {
            this.props.required = false
            this.props.disabled = true
            // no source required, entity type specified
            this.placeholder$.next(
              `${formatEvidenceEnum(entityType)} ${
                this.stateEntityName
              } does not include associated sources`
            )
          }
          // if entity type is required, toggle field required property off and show a 'Select Type..' prompt
          if (!entityType && this.props.requireType) {
            this.props.required = false
            this.props.disabled = true
            // no source required, entity type not specified
            this.placeholder$.next(
              `Select ${this.stateEntityName} Type to search Sources`
            )
          }
          // state indicates source is required, set required, unset disabled, and show the placeholder (state will only return true from requiresSource$ if entityType provided)
          if (requiresSource) {
            this.props.required = true
            this.props.disabled = false
            this.placeholder$.next('Search Sources')
          }
          // field currently has a value, but state indicates no source is required, or no type is provided && type is required, so reset field
          if (
            (!requiresSource && this.formControl.value) ||
            (this.props.requireType && !entityType && this.formControl.value)
          ) {
            this.resetField()
          }
        }
      )
  }

  getTypeaheadVarsFn(partialId: string): SourceSelectTypeaheadQueryVariables {
    return { partialCitationId: partialId, sourceType: SourceSource.Pubmed }
  }

  getTypeaheadResultsFn(r: ApolloQueryResult<SourceSelectTypeaheadQuery>) {
    return r.data.sourceTypeahead
  }

  getTagQueryVarsFn(id: number): SourceSelectTagQueryVariables {
    return { id: id }
  }

  getTagQueryResultsFn(
    r: ApolloQueryResult<SourceSelectTagQuery>
  ): Maybe<SourceSelectTypeaheadFieldsFragment> {
    return r.data.source
  }

  getSelectedItemOptionFn(
    source: SourceSelectTypeaheadFieldsFragment
  ): NzSelectOptionInterface {
    return { value: source.id, label: source.name }
  }

  getSelectOptionsFn(
    results: SourceSelectTypeaheadFieldsFragment[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return results.map(
      (source: SourceSelectTypeaheadFieldsFragment, index: number) => {
        return <NzSelectOptionInterface>{
          label: tplRefs.get(index) || source.name,
          value: source.id,
        }
      }
    )
  }
}
