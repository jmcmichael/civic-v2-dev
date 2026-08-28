import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'
import {
  UpdateCoiGQL,
  UpdateCoiMutation,
  UpdateCoiMutationVariables,
} from './user-coi.mutation.gql.generated'
import { Maybe, UpdateCoiInput } from '@app/generated/civic.apollo.types'

import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'cvc-user-coi-form',
  templateUrl: './user-coi.form.html',
  styleUrls: ['./user-coi.form.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcUserCoiForm implements OnDestroy {
  private formMutation = inject(FormMutationService)
  @Output() coiUpdatedEvent = new EventEmitter<void>()

  coiText: Maybe<string> = undefined
  coiStatus: string = 'noCoi'

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return this.mutationState?.errors() ?? []
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  private destroy$ = new Subject<void>()

  constructor(private updateCoiGql: UpdateCoiGQL) {}

  updateCoi() {
    if (
      (this.coiStatus === 'coiPresent' && this.coiText) ||
      this.coiStatus === 'noCoi'
    ) {
      this.success = false
      let coiInput: UpdateCoiInput = {
        coiPresent: this.coiStatus === 'coiPresent' ? true : false,
        statement: this.coiText,
      }

      this.mutationState = this.formMutation.mutate(
        this.updateCoiGql,
        { input: coiInput },
        undefined,
        () => {
          this.resetForm()
          this.success = true
          this.coiUpdatedEvent.emit()
        }
      )
    }
  }

  resetForm() {
    this.coiStatus = 'noCoi'
    this.coiText = undefined
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
