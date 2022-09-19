import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
} from '@angular/core'
import { ApolloQueryResult } from '@apollo/client/core'
import { BaseFieldType } from '@app/forms2/mixins/base/field-type-base'
import { EntityTagField } from '@app/forms2/mixins/entity-tag-field.mixin'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import {
  InputMaybe,
  LinkableGeneGQL,
  LinkableVariantGQL,
  Maybe,
  VariantSelectLinkableVariantQuery,
  VariantSelectLinkableVariantQueryVariables,
  VariantSelectTypeaheadFieldsFragment,
  VariantSelectTypeaheadGQL,
  VariantSelectTypeaheadQuery,
  VariantSelectTypeaheadQueryVariables,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'
import { QueryRef } from 'apollo-angular'
import { BehaviorSubject, filter, lastValueFrom, Subject } from 'rxjs'
import mixin from 'ts-mixin-extended'

export interface CvcVariantSelectFieldProps extends FormlyFieldProps {
  placeholder: string // default placeholder
  isRepeatItem: boolean // is child of a repeat-field type
  requireGene: boolean // if true, disables field if no geneId$
  requireGenePlaceholder?: string // placeholder if geneId required & none is set
  requireGenePrompt?: string // placeholder prompt displayed when geneId set
}

export interface CvcVariantSelectFieldConfig
  extends FormlyFieldConfig<CvcVariantSelectFieldProps> {
  type: 'variant-select' | 'variant-select-item' | Type<CvcVariantSelectField>
}

const VariantSelectMixin = mixin(
  BaseFieldType<FieldTypeConfig<CvcVariantSelectFieldProps>, Maybe<number>>(),
  EntityTagField<
    VariantSelectTypeaheadQuery,
    VariantSelectTypeaheadQueryVariables,
    VariantSelectTypeaheadFieldsFragment,
    VariantSelectLinkableVariantQuery,
    VariantSelectLinkableVariantQueryVariables,
    VariantSelectTypeaheadFieldsFragment,
    InputMaybe<number>
  >()
)

@UntilDestroy()
@Component({
  selector: 'cvc-variant-select',
  templateUrl: './variant-select.type.html',
  styleUrls: ['./variant-select.type.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantSelectField
  extends VariantSelectMixin
  implements AfterViewInit
{
  // STATE STREAMS
  state: Maybe<EvidenceState>
  // receive geneId updates from state
  onGeneId$!: BehaviorSubject<Maybe<number>>
  // send variantId updates to state
  variantId$!: Subject<Maybe<number>>

  // PRESENTATION STREAMS
  placeholder$!: BehaviorSubject<string>

  queryRef!: QueryRef<
    VariantSelectTypeaheadQuery,
    VariantSelectTypeaheadQueryVariables
  >

  // FieldTypeConfig defaults
  defaultOptions: Partial<FieldTypeConfig<CvcVariantSelectFieldProps>> = {
    props: {
      label: 'Variant',
      placeholder: 'Search Variants',
      requireGene: true,
      requireGenePlaceholder: 'Search GENE_NAME Variants',
      requireGenePrompt: 'Select a Gene to search Variants',
      isRepeatItem: false,
    },
  }

  repeatFieldKey?: string

  constructor(
    public injector: Injector,
    private taq: VariantSelectTypeaheadGQL,
    private tq: LinkableVariantGQL,
    private geneQuery: LinkableGeneGQL
  ) {
    super(injector)
  }

  ngAfterViewInit(): void {
    this.configureBaseField()

    // if this is a repeat-item, attach dummy state fields that emit
    // undefined, so that response$ query's withLatestFrom succeeds
    if (this.props.isRepeatItem) {
      // this.onGeneId$ = new BehaviorSubject<Maybe<number>>(undefined)
    } else {
      // find formState's geneId$ subject, subscribe to call onGeneId for new events
      if (this.field.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.geneId$) {
          this.onGeneId$ = this.state.fields.geneId$
          this.onGeneId$.pipe(untilDestroyed(this)).subscribe((gid) => {
            this.onGeneId(gid)
          })
        } else {
          if (this.props.requireGene) {
            console.error(
              `variant-input ${this.field.id} requireGene is true, but could not find a geneId$ on formState.field.`
            )
          }
        }
      }

      // get variantId$ reference from state, subscribe to field value changes
      // and emit new variantIds from formState's variantId$
      if (this.field?.options?.formState) {
        this.state = this.field.options.formState
        if (this.state && this.state.fields.variantId$) {
          this.variantId$ = this.state.fields.variantId$
          if (this.variantId$ && this.field.options?.fieldChanges) {
            this.field.options.fieldChanges
              .pipe(
                filter((c) => c.field.id === this.field.id), // filter out other fields
                untilDestroyed(this)
              )
              .subscribe((change) => {
                this.variantId$!.next(change.value)
              })
          }
        }
      }
    }

    this.configureEntityTagField(
      // typeahead query
      this.taq,
      // linkable entity query
      this.tq,
      // typeahead query vars getter fn
      (str: string, param: InputMaybe<number>) => ({
        name: str,
        geneId: param,
      }),
      // typeahead query result map fn
      (r: ApolloQueryResult<VariantSelectTypeaheadQuery>) =>
        r.data.variants.nodes,
      // linkable entity query vars getter fn
      (id: number) => ({ variantId: id }),
      // tag cache id getter fn
      (r: ApolloQueryResult<VariantSelectLinkableVariantQuery>) =>
        `Variant:${r.data.variant!.id}`,
      // optional additional typeahead param observable from state
      this.onGeneId$
    )

    // if field has been assigned a value before its initialization,
    // emit onValueChanges event
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      if (this.onValueChange$) this.onValueChange$.next(v)
    }

    // show prompt to select a gene if requireGene true
    // otherwise show standard placeholder
    let initialPlaceholder: string
    if (this.props.requireGene && this.props.requireGenePrompt) {
      initialPlaceholder = this.props.requireGenePrompt
    } else {
      initialPlaceholder = this.props.placeholder
    }
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)
  } // ngAfterViewInit

  private onGeneId(gid: Maybe<number>): void {
    // if field config indicates that a geneId is required, and none is provided,
    // set model to undefined (this resets the variant model if gene field is reset)
    // and update the placeholder message
    if (!gid && this.props.requireGene && this.props.requireGenePrompt) {
      this.resetField()
      this.placeholder$.next(this.props.requireGenePrompt)
    } else if (gid) {
      // we have a gene id, so fetch its name and update the placeholder string
      lastValueFrom(
        this.geneQuery.fetch({ geneId: gid }, { fetchPolicy: 'cache-first' })
      ).then(({ data }) => {
        if (!data?.gene?.name) {
          console.error(
            `variant-input field could not fetch gene name for Gene:${gid}.`
          )
        } else {
          if (this.props.requireGenePlaceholder) {
            const ph = this.props.requireGenePlaceholder.replace(
              'GENE_NAME',
              data.gene.name
            )
            this.placeholder$.next(ph)
          } else {
            this.placeholder$.next(this.props.placeholder)
          }
        }
      })
    }
  }
}
