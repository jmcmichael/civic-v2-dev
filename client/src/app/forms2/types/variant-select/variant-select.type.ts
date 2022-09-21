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
import { EntityState } from '@app/forms2/states'
import {
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
import { BehaviorSubject, lastValueFrom } from 'rxjs'
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
  // ConnectState(),
  EntityTagField<
    VariantSelectTypeaheadQuery,
    VariantSelectTypeaheadQueryVariables,
    VariantSelectTypeaheadFieldsFragment,
    VariantSelectLinkableVariantQuery,
    VariantSelectLinkableVariantQueryVariables,
    VariantSelectTypeaheadFieldsFragment,
    Maybe<number>
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
  state?: EntityState

  // sent variantId updates to state
  stateValueChange$?: BehaviorSubject<Maybe<number>>
  // receive geneId updates from state
  onGeneId$!: BehaviorSubject<Maybe<number>>

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
    this.configureStateListeners()
    this.configureEntityTagField(
      // typeahead query
      this.taq,
      // linkable entity query
      this.tq,
      // typeahead query vars getter fn
      (str: string, param: Maybe<number>) => ({
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
      // attach state's geneId$ optional typeahead param
      this.onGeneId$ ? this.onGeneId$ : undefined
    )

    // hook up state geneId$ observable
    if (this.onGeneId$) {
      this.onGeneId$.subscribe((gid) => {
        this.onGeneId(gid)
      })
    }

    // set initial placeholder & subject
    let initialPlaceholder: string
    if (this.props.requireGene && this.props.requireGenePrompt) {
      initialPlaceholder = this.props.requireGenePrompt
    } else {
      initialPlaceholder = this.props.placeholder
    }
    this.placeholder$ = new BehaviorSubject<string>(initialPlaceholder)

    // if field's formControl has already been assigned a value
    // (e.g. via query-param extension, saved form state,
    // model initialization), emit onValueChange$, state valueChange$ events
    if (this.field.formControl.value) {
      const v = this.field.formControl.value
      this.onValueChange$.next(v)
      // valueChange$ may not exist if component is a repeat-item or form state missing
      if (!this.onGeneId$) return
      this.onGeneId$.next(v)
    }
  } // ngAfterViewInit

  private configureStateListeners() {
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
            `variant-input field could not fetch gene name for Gene:${gid}.`
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
        }
      })
    }
  }

  optionTrackBy: TrackByFunction<VariantSelectTypeaheadFieldsFragment> = (
    _index: number,
    option: VariantSelectTypeaheadFieldsFragment
  ): number => {
    return option.id
  }
}
