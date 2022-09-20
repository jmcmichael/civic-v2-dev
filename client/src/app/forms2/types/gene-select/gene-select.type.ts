import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { ConnectState } from '@app/forms2/mixins/connect-state.mixin'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EvidenceFieldSubject, EvidenceOptionsSubject, EvidenceRequiresSubject, EvidenceState } from '@app/forms2/states/evidence.state'
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
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core'
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
  ConnectState(),
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
    // if form state object exists, configure ConnectState mixin
    if (this.field.options?.formState) {
      this.configureConnectState(this.field.options.formState, {
        valueChanges: this.props.isRepeatItem ? undefined : 'geneId$',
      })
    } else {
      console.warn(
        `${this.field.id} applies ConnectState mixin, but form does not provide a formState.`
      )
    }
    this.configureEntityTagField(
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
    )

    // on tag close, emit undefined from state valueChange$
    this.onTagClose$.pipe(untilDestroyed(this)).subscribe((_v) => {
      // state valueChange$ may not exist if component is a repeat-item or form state missing
      if (!this.valueChange$) return
      this.valueChange$.next(undefined)
    })

    // if field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state,
    // model initialization), emit onValueChange$, state valueChange$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
      // valueChange$ may not exist if component is a repeat-item or form state missing
      if (!this.valueChange$) return
      this.valueChange$.next(v)
    }
  } // ngAfterViewInit()
}
