import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  TrackByFunction,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import {
  CvcSelectEntityName,
  CvcSelectMessageOptions,
} from '@app/forms2/components/entity-select/entity-select.component'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base-DEPRECATED'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EntityState } from '@app/forms2/states/entity.state'
import {
  Gene,
  GeneSelectLinkableGeneQuery,
  GeneSelectLinkableGeneQueryVariables,
  GeneSelectTypeaheadFieldsFragment,
  GeneSelectTypeaheadGQL,
  GeneSelectTypeaheadQuery,
  GeneSelectTypeaheadQueryVariables,
  LinkableGeneGQL,
  Maybe,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  isRepeatItem: boolean
  entityName: CvcSelectEntityName
  selectMessages: CvcSelectMessageOptions
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
    GeneSelectLinkableGeneQuery,
    GeneSelectLinkableGeneQueryVariables,
    Gene
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

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcGeneSelectFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search Genes',
      isRepeatItem: false,
      entityName: { singular: 'Gene', plural: 'Genes' },
      selectMessages: {
        focus: 'Enter query to search',
        loading: 'Searching Genes',
        notfound: 'No Genes found matching "SEARCH_STRING"',
        create: 'Create a new Gene named "SEARCH_STRING"?',
      },
    },
  }

  constructor(
    public injector: Injector,
    private taq: GeneSelectTypeaheadGQL,
    private tq: LinkableGeneGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureEntityTagField({
      typeaheadQuery: this.taq,
      typeaheadParam$: undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: (str: string) => ({ entrezSymbol: str }),
      getTypeaheadResultsFn: (r: ApolloQueryResult<GeneSelectTypeaheadQuery>) =>
        r.data.geneTypeahead,
      getTagQueryVarsFn: (id: number) => ({ geneId: id }),
      getTagCacheIdFromResponseFn: (
        r: ApolloQueryResult<GeneSelectLinkableGeneQuery>
      ) => `Gene:${r.data.gene!.id}`,
      getSelectOptionsFromResultsFn: (
        results: GeneSelectTypeaheadFieldsFragment[],
        tplRefs: QueryList<TemplateRef<any>>
      ): NzSelectOptionInterface[] => {
        return results.map(
          (drug: GeneSelectTypeaheadFieldsFragment, index: number) => {
            return <NzSelectOptionInterface>{
              label: tplRefs.get(index) || drug.name,
              value: drug.id,
            }
          }
        )
      },
      changeDetectorRef: this.changeDetectorRef,
    })
    this.configureStateConnections() // local fn
    this.configureOnTagClose() // local fn
    this.configureInitialValueHandler() // local fn
  } // ngAfterViewInit()

  private configureStateConnections(): void {
    // if this is not a repeat-item field, attach state's
    // geneId$ subject and emit all onValueChanges$ from it
    if (!this.props.isRepeatItem && this.field.options?.formState) {
      this.state = this.field.options.formState
      // attach state variantId$ to send field value updates
      if (this.state && this.state.fields.geneId$) {
        this.stateValueChange$ = this.state.fields.geneId$
        this.onValueChange$
          .pipe(
            // tag(`${this.field.id} onValueChange$ stateValueChange$`),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.stateValueChange$) this.stateValueChange$.next(v)
          })
      }
    }
  }

  onSearch(str: string): void {
    console.log(str)
    this.onSearch$.next(str)
  }

  private configureOnTagClose(): void {
    // emit undefined from state valueChange$
    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_v) => {
      // state valueChange$ may not exist if
      // component is a repeat-item or form state missing
      if (!this.stateValueChange$) return
      this.stateValueChange$.next(undefined)
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

  // optionTrackBy: TrackByFunction<GeneSelectTypeaheadFieldsFragment> = (
  //   _index: number,
  //   option: GeneSelectTypeaheadFieldsFragment
  // ): number => {
  //   return option.id
  // }
}
