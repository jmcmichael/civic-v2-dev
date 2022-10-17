import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  Type,
  ViewChildren,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { CvcSelectEntityName } from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base-DEPRECATED'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EntityState } from '@app/forms2/states/entity.state'
import {
  GeneSelectTagGQL,
  GeneSelectTagQuery,
  GeneSelectTagQueryVariables,
  GeneSelectTypeaheadFieldsFragment,
  GeneSelectTypeaheadGQL,
  GeneSelectTypeaheadQuery,
  GeneSelectTypeaheadQueryVariables,
  Maybe,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject } from 'rxjs'
import mixin from 'ts-mixin-extended'

export interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  isMultiSelect: boolean
  entityName: CvcSelectEntityName
}

export interface CvcGeneSelectFieldConfig
  extends FormlyFieldConfig<CvcGeneSelectFieldProps> {
  type: 'gene-select' | 'gene-select-item' | Type<CvcGeneSelectField>
}

const GeneSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcGeneSelectFieldProps>, Maybe<number>>(),
  EntityTagField<
    GeneSelectTypeaheadQuery,
    GeneSelectTypeaheadQueryVariables,
    GeneSelectTypeaheadFieldsFragment,
    GeneSelectTagQuery,
    GeneSelectTagQueryVariables,
    Maybe<number>
  >()
)

@Component({
  selector: 'cvc-gene-select',
  templateUrl: './gene-select.type.html',
  styleUrls: ['./gene-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcGeneSelectField
  extends GeneSelectMixin
  implements AfterViewInit
{
  state?: EntityState
  // STATE SOURCE STREAMS
  // LOCAL SOURCE STREAMS
  // LOCAL INTERMEDIATE STREAMS
  // LOCAL PRESENTATION STREAMS
  selectOption$!: BehaviorSubject<NzSelectOptionInterface[]>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcGeneSelectFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search Genes',
      isMultiSelect: false,
      entityName: { singular: 'Gene', plural: 'Genes' },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(
    public injector: Injector,
    private taq: GeneSelectTypeaheadGQL,
    private tq: GeneSelectTagGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector)
    this.selectOption$ = new BehaviorSubject<NzSelectOptionInterface[]>([])
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
  } // ngAfterViewInit()

  getTypeaheadVarsFn(str: string): GeneSelectTypeaheadQueryVariables {
    return { entrezSymbol: str }
  }

  getTypeaheadResultsFn(r: ApolloQueryResult<GeneSelectTypeaheadQuery>) {
    return r.data.geneTypeahead
  }

  getTagQueryVarsFn(id: number): GeneSelectTagQueryVariables {
    return { geneId: id }
  }

  getTagQueryResultsFn(
    r: ApolloQueryResult<GeneSelectTagQuery>
  ): Maybe<GeneSelectTypeaheadFieldsFragment> {
    return r.data.gene
  }

  getSelectedItemOptionFn(
    gene: GeneSelectTypeaheadFieldsFragment
  ): NzSelectOptionInterface {
    return { value: gene.id, label: gene.name }
  }

  getSelectOptionsFn(
    results: GeneSelectTypeaheadFieldsFragment[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return results.map(
      (gene: GeneSelectTypeaheadFieldsFragment, index: number) => {
        return <NzSelectOptionInterface>{
          label: tplRefs.get(index) || gene.name,
          value: gene.id,
        }
      }
    )
  }

  configureStateConnections(): void {
    if (!this.field.options?.formState) return
    this.state = this.field.options.formState

    if (this.state && this.state.fields.geneId$) {
      this.stateValueChange$ = this.state.fields.geneId$
      this.onValueChange$.pipe(untilDestroyed(this)).subscribe((v) => {
        if (this.stateValueChange$) this.stateValueChange$.next(v)
      })
      // update state if field has been prepopulated w/ query param or preset model
      if (this.formControl.value) {
        this.stateValueChange$.next(this.formControl.value)
      }
    }
  }
}
