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
  LinkableGeneGQL,
  Maybe,
  VariantSelectTagGQL,
  VariantSelectTagQuery,
  VariantSelectTagQueryVariables,
  VariantSelectTypeaheadFieldsFragment,
  VariantSelectTypeaheadGQL,
  VariantSelectTypeaheadQuery,
  VariantSelectTypeaheadQueryVariables,
} from '@app/generated/civic.apollo'
import { untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, lastValueFrom } from 'rxjs'
import mixin from 'ts-mixin-extended'

export interface CvcVariantSelectFieldProps extends FormlyFieldProps {
  isMultiSelect: boolean // is child of a repeat-field type
  entityName: CvcSelectEntityName
  requireGene: boolean // if true, disables field if no geneId$
  placeholder: string // default placeholder
  requireGenePlaceholder?: string // placeholder if geneId required & none is set
  requireGenePrompt?: string // placeholder prompt displayed after geneId set
}

export interface CvcVariantSelectFieldConfig
  extends FormlyFieldConfig<CvcVariantSelectFieldProps> {
  type: 'variant-select' | 'variant-select-array' | Type<CvcVariantSelectField>
}

const VariantSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcVariantSelectFieldProps>, Maybe<number>>(),
  EntityTagField<
    VariantSelectTypeaheadQuery,
    VariantSelectTypeaheadQueryVariables,
    VariantSelectTypeaheadFieldsFragment,
    VariantSelectTagQuery,
    VariantSelectTagQueryVariables,
    Maybe<number>
  >()
)

@Component({
  selector: '',
  templateUrl: './variant-select.type.html',
  styleUrls: ['./variant-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantSelectField
  extends VariantSelectMixin
  implements AfterViewInit
{
  state?: EntityState

  // STATE SOURCE STREAMS
  onGeneId$!: BehaviorSubject<Maybe<number>>

  // LOCAL SOURCE STREAMS
  onGeneName$: BehaviorSubject<Maybe<string>>

  // LOCAL PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>

  // STATE OUTPUT STREAMS
  stateValueChange$?: BehaviorSubject<Maybe<number>>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcVariantSelectFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search Variants',
      requireGene: true,
      requireGenePlaceholder: 'Search GENE_NAME Variants',
      requireGenePrompt: 'Select a Gene to search Variants',
      isMultiSelect: false,
      entityName: { singular: 'Variant', plural: 'Variant' },
    },
  }

  @ViewChildren('optionTemplates', { read: TemplateRef })
  optionTemplates?: QueryList<TemplateRef<any>>

  constructor(
    public injector: Injector,
    private taq: VariantSelectTypeaheadGQL,
    private tq: VariantSelectTagGQL,
    private geneQuery: LinkableGeneGQL,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector)
    this.onGeneName$ = new BehaviorSubject<Maybe<string>>(undefined)
  }

  ngAfterViewInit(): void {
    this.configureBaseField() // mixin fn
    this.configureStateConnections() // local fn
    this.configureEntityTagField({
      typeaheadQuery: this.taq,
      typeaheadParam$: this.onGeneId$ ? this.onGeneId$ : undefined,
      tagQuery: this.tq,
      getTypeaheadVarsFn: this.getTypeaheadVarsFn,
      getTypeaheadResultsFn: this.getTypeaheadResultsFn,
      getTagQueryVarsFn: this.getTagQueryVarsFn,
      getTagQueryResultsFn: this.getTagQueryResultsFn,
      getSelectedItemOptionFn: this.getSelectedItemOptionFn,
      getSelectOptionsFn: this.getSelectOptionsFn,
      changeDetectorRef: this.changeDetectorRef,
    })

    // set initial placeholder & subject
    let initialPlaceholder: string
    if (this.props.requireGene && this.props.requireGenePrompt) {
      initialPlaceholder = this.props.requireGenePrompt
    } else {
      initialPlaceholder = this.props.placeholder
    }
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)
  } // ngAfterViewInit

  getTypeaheadVarsFn(str: string, param: Maybe<number>) {
    return {
      name: str,
      geneId: param,
    }
  }

  getTypeaheadResultsFn(r: ApolloQueryResult<VariantSelectTypeaheadQuery>) {
    return r.data.variants.nodes
  }

  getTagQueryVarsFn(id: number): VariantSelectTagQueryVariables {
    return { variantId: id }
  }

  getTagQueryResultsFn(
    r: ApolloQueryResult<VariantSelectTagQuery>
  ): Maybe<VariantSelectTypeaheadFieldsFragment> {
    return r.data.variant
  }

  getSelectedItemOptionFn(
    variant: VariantSelectTypeaheadFieldsFragment
  ): NzSelectOptionInterface {
    return { value: variant.id, label: variant.name }
  }

  getSelectOptionsFn(
    results: VariantSelectTypeaheadFieldsFragment[],
    tplRefs: QueryList<TemplateRef<any>>
  ): NzSelectOptionInterface[] {
    return results.map(
      (variant: VariantSelectTypeaheadFieldsFragment, index: number) => {
        return <NzSelectOptionInterface>{
          label: tplRefs.get(index) || variant.name,
          value: variant.id,
        }
      }
    )
  }

  private configureStateConnections() {
    if (!this.props.requireGene) return
    if (!this.field.options?.formState) {
      console.error(
        `${this.field.id} requireGene is set, but no formState found.`
      )
      return
    }
    this.state = this.field.options.formState
    if (!this.state?.fields.geneId$) {
      console.error(
        `${this.field.id} requireGene is set, but no geneId$ subject found on state.`
      )
      return
    }
    // attach state geneId$ to get gene field value updates
    this.onGeneId$ = this.state.fields.geneId$
    this.onGeneId$.pipe(untilDestroyed(this)).subscribe((gid) => {
      this.onGeneId(gid)
    })
  }

  private onGeneId(gid: Maybe<number>): void {
    // if field config indicates that a geneId is required, and none is provided,
    // set model to undefined (this resets the variant model if gene field is reset)
    // and set placeholder to the 'requires gene' placeholder
    if (!gid && this.props.requireGene && this.props.requireGenePrompt) {
      this.resetField()
      this.placeholder$.next(this.props.requireGenePrompt)
    } else if (gid) {
      // id provided, so fetch its name and update the placeholder string
      // lastValueFrom is used b/c fetch could return 'loading' events
      lastValueFrom(
        this.geneQuery.fetch({ geneId: gid }, { fetchPolicy: 'cache-first' })
      ).then(({ data }) => {
        if (!data?.gene?.name) {
          console.error(
            `${this.field.id} could not fetch gene name for Gene:${gid}.`
          )
        } else {
          // apply regex to include gene name in placeholder string
          if (this.props.requireGenePlaceholder) {
            const ph = this.props.requireGenePlaceholder.replace(
              'GENE_NAME',
              data.gene.name
            )
            this.placeholder$.next(ph)
          } else {
            this.placeholder$.next(this.props.placeholder)
          }
          // emit gene name for quick-add form Input
          this.onGeneName$.next(data.gene.name)
        }
      })
    }
  }

}
