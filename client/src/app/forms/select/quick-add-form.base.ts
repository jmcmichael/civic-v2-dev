import { Directive, EventEmitter, inject, Input, Output } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { MutationState } from '@app/core/utilities/mutation-state-wrapper'
import { NoStateFormOptions } from '@app/forms/states/base.state'
import { Maybe } from '@app/generated/civic.apollo.types'
import { NzFormLayoutType } from 'ng-zorro-antd/form'

/**
 * Scaffolding shared by the entity quick-add forms (disease, therapy,
 * feature, variant): the form group + layout options, mutation display
 * state, and the search-string → model.name input. Subclasses declare the
 * formly fields and mutation, and implement onSubmit; onSearchString is a
 * hook for the forms that show an inline hint message.
 *
 * source-quick-add stays outside the family — its citation lookup and
 * cache seeding share none of this shape.
 */
@Directive()
export abstract class CvcQuickAddFormBase<
  TModel extends { name?: string },
  TCreate,
> {
  @Output() cvcOnCreate = new EventEmitter<TCreate>()

  @Input()
  set cvcSearchString(str: Maybe<string>) {
    if (!str) return
    this.model = { ...this.model, name: str }
    this.onSearchString(str)
  }

  abstract model: TModel

  form = new UntypedFormGroup({})
  formLayout: NzFormLayoutType = 'horizontal'
  options: NoStateFormOptions = { formState: { formLayout: this.formLayout } }

  protected readonly errors = inject(NetworkErrorsService)

  mutationState?: MutationState
  successMessage?: string

  abstract onSubmit(model: TModel): void
  protected onSearchString(_str: string): void {}
}
