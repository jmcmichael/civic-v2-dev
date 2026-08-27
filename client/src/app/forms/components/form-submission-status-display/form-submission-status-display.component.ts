import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  effect,
  inject,
  signal,
} from '@angular/core'
import { Router } from '@angular/router'
import { FormMutationState } from '@app/forms/utilities/form-mutation'
import { Maybe } from '@app/generated/civic.apollo.types'

@Component({
  selector: 'cvc-form-submission-status-display',
  templateUrl: './form-submission-status-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcFormSubmissionStatusDisplayComponent {
  private router = inject(Router)

  protected readonly state = signal<Maybe<FormMutationState>>(undefined)
  private currentTimer?: ReturnType<typeof setTimeout>

  @Input() set mutationState(value: Maybe<FormMutationState>) {
    if (this.currentTimer) {
      clearTimeout(this.currentTimer)
      this.currentTimer = undefined
    }
    this.state.set(value)
  }

  @Input() entityType?:
    | 'Assertion'
    | 'Disease'
    | 'Evidence Item'
    | 'Source Suggestion'
    | 'Revision'
    | 'Molecular Profile'
    | 'Source'
    | 'Variant'
    | 'Comment'
    | 'Gene'
    | 'Variant Group'
    | 'Feature'
    | 'Therapy'

  @Input() successMessage?: TemplateRef<void>
  @Input() redirectUrl?: string

  constructor() {
    effect(() => {
      if (this.state()?.success() && this.redirectUrl) {
        const url = this.redirectUrl
        this.currentTimer = setTimeout(() => {
          this.router.navigateByUrl(url)
        }, 2500)
      }
    })
  }
}
