import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { DisplayEntityTag } from '@app/forms2/mixins/display-entity-tag.mixin'
import { EvidenceState } from '@app/forms2/states/evidence.state'
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
import { Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

export interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  isRepeatItem: boolean
}

export interface CvcGeneSelectFieldConfig
  extends FormlyFieldConfig<CvcGeneSelectFieldProps> {
  type: 'gene-select' | 'gene-select-item' | Type<CvcGeneSelectField>
}

const GeneSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcGeneSelectFieldProps>, Maybe<number>>(),
  DisplayEntityTag<
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
  // STATE STREAMS
  geneId$?: Subject<Maybe<number>> // emit values from state's Subject

  state: Maybe<EvidenceState>

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcGeneSelectFieldProps>> = {
    props: {
      label: 'Gene',
      placeholder: 'Search Genes',
      isRepeatItem: false,
    },
  }

  constructor(
    public injector: Injector,
    private taq: GeneSelectTypeaheadGQL,
    private tq: LinkableGeneGQL // gql query for fetching linkable tag if not cached
  ) {
    super(injector)
  }

  // formly's field is assigned OnInit, so field setup must occur in AfterViewInit
  ngAfterViewInit(): void {
    this.configureBaseField()
    this.configureDisplayEntityTag(
      // typeahead query
      this.taq,
      // linkable entity query
      this.tq,
      // typeahead query vars getter fn
      (str: string) => ({ entrezSymbol: str }),
      // typeahead query result map fn
      (r: ApolloQueryResult<GeneSelectTypeaheadQuery>) => r.data.geneTypeahead,
      // tag query vars getter fn
      (id: number) => ({ geneId: id }),
      // tag cache id getter fn
      (r: ApolloQueryResult<GeneSelectLinkableGeneQuery>) =>
        `Gene:${r.data.gene!.id}`
      // optional additoinal typeahead param observable from state
    )

    // do not attach repeat-field items to state
    if (!this.props.isRepeatItem) {
      // if form has a state object,
      // get field's Subject from state & emit local value updates from it
      if (this.field?.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.geneId$) {
          this.geneId$ = this.state.fields.geneId$
          this.onValueChange$.pipe(untilDestroyed(this)).subscribe((v) => {
            if (this.geneId$) this.geneId$.next(v)
          })
        }
      }
    }

    // if field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state,
    // model initialization), emit onValueChange$, geneId$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
      if (this.geneId$) this.geneId$.next(v)
    }
  } // ngAfterViewInit()
}
