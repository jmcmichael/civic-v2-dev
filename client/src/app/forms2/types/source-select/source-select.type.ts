import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { formatSourceTypeEnum } from '@app/core/utilities/enum-formatters/format-source-type-enum'
import { CvcSelectEntityName } from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/base-field'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import {
  Maybe,
  SourceSelectTagGQL,
  SourceSelectTagQuery,
  SourceSelectTagQueryVariables,
  SourceSelectTypeaheadFieldsFragment,
  SourceSelectTypeaheadGQL,
  SourceSelectTypeaheadQuery,
  SourceSelectTypeaheadQueryVariables,
  SourceSource,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject, withLatestFrom } from 'rxjs'
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
    SourceSource
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
  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  sourceType$: BehaviorSubject<SourceSource>
  // LOCAL PRESENTATION STREAMS
  placeholder$: BehaviorSubject<string>
  sourceTypeName$: BehaviorSubject<string>

  defaultSourceType: SourceSource = SourceSource.Pubmed

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
      tooltip: 'Source(s) that support items, statements or descriptions.',
      placeholders: {
        default: 'Search Sources',
        multiDefault: 'Select Source(s)',
      },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(
    private taq: SourceSelectTypeaheadGQL,
    private tq: SourceSelectTagGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super()
    this.placeholder$ = new BehaviorSubject<string>(
      this.defaultOptions.props!.placeholders!.default
    )
    this.sourceType$ = new BehaviorSubject<SourceSource>(this.defaultSourceType)
    this.sourceTypeName$ = new BehaviorSubject<string>(
      formatSourceTypeEnum(this.defaultSourceType)
    )
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureEntityTagField({
      // mixin fn
      typeaheadQuery: this.taq,
      typeaheadParam$: this.sourceType$,
      typeaheadParamName$: this.sourceTypeName$ || undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: this.getTypeaheadVarsFn,
      getTypeaheadResultsFn: this.getTypeaheadResultsFn,
      getTagQueryVarsFn: this.getTagQueryVarsFn,
      getTagQueryResultsFn: this.getTagQueryResultsFn,
      getSelectedItemOptionFn: this.getSelectedItemOptionFn,
      getSelectOptionsFn: this.getSelectOptionsFn,
      changeDetectorRef: this.changeDetectorRef,
    })
    this.configureLabels()

    // TODO: implement using withLatestFrom(onSearch$), so we emit that from onSearch$.next() below. onSearch$ kicks off the search query, which needs to be updated w/ the new sourceType param
    this.sourceType$
      .pipe(withLatestFrom(this.onSearch$), untilDestroyed(this))
      .subscribe(([src, str]: [SourceSource, string]) => {
        this.onSearch$.next(str)
        this.sourceTypeName$.next(formatSourceTypeEnum(src))
      })
  }

  getTypeaheadVarsFn(
    str: string,
    param: SourceSource = SourceSource.Pubmed
  ): SourceSelectTypeaheadQueryVariables {
    return { partialCitationId: str, sourceType: param }
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
