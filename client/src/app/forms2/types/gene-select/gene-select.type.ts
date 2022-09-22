import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  TrackByFunction,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
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
import { BehaviorSubject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import mixin from 'ts-mixin-extended'

export interface CvcGeneSelectFieldProps extends FormlyFieldProps {
  placeholder: string
  searchMinLength: number // # chars required to query
  isRepeatItem: boolean
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
      searchMinLength: 1
    },
  }

  constructor(
    public injector: Injector,
    private taq: GeneSelectTypeaheadGQL,
    private tq: LinkableGeneGQL
  ) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField()
    this.configureEntityTagField(
      // typeahead query
      this.taq,
      // linkable entity query
      this.tq,
      // typeahead query vars getter fn
      (str: string) => ({ entrezSymbol: str }),
      // typeahead query result map fn
      (r: ApolloQueryResult<GeneSelectTypeaheadQuery>) => {
        return r.data.geneTypeahead
      },
      // tag query vars getter fn
      (id: number) => ({ geneId: id }),
      // tag cache id getter fn
      (r: ApolloQueryResult<GeneSelectLinkableGeneQuery>) =>
        `Gene:${r.data.gene!.id}`
    )
    this.configureStateConnections()
    this.configureOnTagClose()
    this.configureInitialValueHandler()
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
            tag(`${this.field.id} onValueChange$ stateValueChange$`),
            untilDestroyed(this)
          )
          .subscribe((v) => {
            if (this.stateValueChange$) this.stateValueChange$.next(v)
          })
      }
    }
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

  optionTrackBy: TrackByFunction<GeneSelectTypeaheadFieldsFragment> = (
    _index: number,
    option: GeneSelectTypeaheadFieldsFragment
  ): number => {
    return option.id
  }
}
