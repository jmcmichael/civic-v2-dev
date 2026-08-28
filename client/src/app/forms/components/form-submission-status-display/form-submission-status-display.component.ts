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

  /**
   * Public so descendants can read submit state where it is displayed:
   * cvc-form-error-tag and the form-card wrapper inject this ancestor from
   * the card header and the footer button bar.
   */
  readonly state = signal<Maybe<FormMutationState>>(undefined)

  /**
   * True once the projected form is edited while a submit failure stands;
   * the error indicators hide until the next submit. The form-card wrapper
   * sets it — formly hands the wrapper the form this component cannot see.
   */
  readonly dismissed = signal(false)

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
    // a new submit state or a fresh error list re-arms the indicators
    effect(() => {
      this.state()?.errors()
      this.dismissed.set(false)
    })
  }
}
