import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { MutatorWithState } from '@app/core/utilities/mutation-state-wrapper'
import {
  LinkableGeneGQL,
  Maybe,
  QuickAddVariantGQL,
  QuickAddVariantMutation,
  QuickAddVariantMutationVariables,
} from '@app/generated/civic.apollo'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { Subject } from 'rxjs'

type VariantQuickAddModel = {
  name?: string
  geneId?: number
}

const variantQuickAddInitialModel: VariantQuickAddModel = {
  name: undefined,
  geneId: undefined,
}

@UntilDestroy()
@Component({
  selector: 'cvc-variant-quick-add-form',
  templateUrl: './variant-quick-add.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcVariantQuickAddForm implements AfterViewInit {
  @Input() cvcGeneId?: number
  @Input() cvcSearchString?: string

  model: VariantQuickAddModel = variantQuickAddInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions = {}

  queryMutator: MutatorWithState<
    QuickAddVariantGQL,
    QuickAddVariantMutation,
    QuickAddVariantMutationVariables
  >

  // SOURCE STREAMS
  onSubmit$: Subject<Maybe<VariantQuickAddModel>>

  // PRESENTATION STREAMS
  geneName$: Subject<Maybe<string>>

  constructor(
    private query: QuickAddVariantGQL,
    private geneQuery: LinkableGeneGQL,
    private errors: NetworkErrorsService
  ) {
    this.onSubmit$ = new Subject<Maybe<VariantQuickAddModel>>()
    this.geneName$ = new Subject<Maybe<string>>()

    this.queryMutator = new MutatorWithState(this.errors)

    this.fields = [
      {
        key: 'geneId',
        props: {
          hidden: true,
        },
      },
      {
        key: 'name',
        type: 'input',
        props: {
          label: 'New Variant Name',
          required: true,
        },
      },
    ]

    this.onSubmit$.pipe(untilDestroyed(this)).subscribe((model) => {
      console.log('variant-quick-add form model submitted.', model)
    })
  }

  ngAfterViewInit(): void {
    if (!this.cvcGeneId) {
      console.error(
        `variant-quick-add form requires valid cvcGeneId Input, none provided.`
      )
      return
    }
    this.model.geneId = this.cvcGeneId
    this.model.name = this.cvcSearchString
    // TODO: look up gene name, emit geneName$ event, thus forcing
    // field updates w/ new model values

  }
}
