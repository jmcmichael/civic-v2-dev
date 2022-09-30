import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core'
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
import { BehaviorSubject, Subject } from 'rxjs'

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcVariantQuickAddForm implements OnInit {
  @Input()
  set cvcGeneId(id: number) {
    if(!id) {
      console.error('variant-quick-add form requires cvcGeneId Input, none provided.')
      return
    }
    this.geneId$.next(id)
  }
  @Input()
  set cvcGeneName(name: string) {
    if(!name) {
      console.error('variant-quick-add form requires cvcGeneName Input, none provided.')
      return
    }
    this.geneName$.next(name)
  }

  @Input()
  set cvcSearchString(str: string){
    if(!str) {
      console.error('variant-quick-add form requires cvcSearchString Input, none provided.')
      return
    }
    this.searchString$.next(str)
  }

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
  onSubmit$: Subject<VariantQuickAddModel>
  geneName$: BehaviorSubject<Maybe<string>>
  geneId$: BehaviorSubject<Maybe<number>>
  searchString$: BehaviorSubject<Maybe<string>>

  // PRESENTATION STREAMS

  constructor(
    private query: QuickAddVariantGQL,
    private geneQuery: LinkableGeneGQL,
    private errors: NetworkErrorsService,
    private cdr: ChangeDetectorRef
  ) {
    this.onSubmit$ = new Subject<VariantQuickAddModel>()
    this.geneName$ = new BehaviorSubject<Maybe<string>>(undefined)
    this.geneId$ = new BehaviorSubject<Maybe<number>>(undefined)
    this.searchString$ = new BehaviorSubject<Maybe<string>>(undefined)
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
        props: {
          hidden: true,
        },
      },
    ]

    this.geneId$.pipe(untilDestroyed(this)).subscribe((id: Maybe<number>) => {
     this.model.geneId = id
    })

    this.searchString$.pipe(untilDestroyed(this)).subscribe((str: Maybe<string>) => {
      this.model.name = str
    })

    this.onSubmit$.pipe(untilDestroyed(this)).subscribe((model) => {
      console.log('variant-quick-add form model submitted.', model)
    })
  }

  ngOnInit(): void {
    if (!this.cvcGeneId) {
      console.error(
        `variant-quick-add form requires valid cvcGeneId Input, none provided.`
      )
      return
    }
    // TODO: look up gene name, emit geneName$ event, thus forcing
    // field updates w/ new model values
  }
}
