import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core'
import {
  categoryColor,
  categoryName,
  CvcErrorListComponent,
  submissionErrorsText,
} from '@app/components/app/error-list/error-list.component'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  describeFieldIssues,
  FormFieldIssue,
} from '@app/forms/utilities/form-field-issues'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/** Pre-submit form state, provided by the submit button's field type */
export interface FormReadiness {
  readonly valid: boolean
  readonly issues: FormFieldIssue[]
}

/**
 * Compact submit-state indicator, rendered wherever a form shows submit
 * state: the form card's title (as a tag — a single failure shows its
 * category, several show `[Multiple Errors]`) and the footer button bar
 * (as a small alert — `variant="alert"`). Both open a popover rendering
 * the errors as a cvc-error-list. With no failure displayed, the alert
 * variant reports the `readiness` input instead: an info alert whose
 * popover lists the fields blocking submission, or a success alert once
 * the form is ready.
 *
 * Reads state from the nearest cvc-form-submission-status-display ancestor,
 * so it can be dropped into any template inside one without wiring inputs
 * through formly configs. Renders nothing outside one, or without errors.
 */
@Component({
  selector: 'cvc-form-error-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CvcErrorListComponent,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzPopoverModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './form-error-alert.component.html',
  styleUrl: './form-error-alert.component.less',
})
export class CvcFormErrorAlertComponent {
  readonly variant = input<'tag' | 'alert'>('tag')
  /**
   * Pre-submit form state; when provided, the alert variant reports it
   * whenever no submit failure is displayed — an info alert listing the
   * fields blocking submission, or a success alert once the form is ready
   */
  readonly readiness = input<FormReadiness | undefined>(undefined)

  private statusDisplay = inject(CvcFormSubmissionStatusDisplayComponent, {
    optional: true,
  })

  // what this form submits, for the alert copy ("revision may be
  // submitted"); the ancestor display's inputs are static per form
  private get noun(): string {
    return (
      this.statusDisplay?.submissionNoun ??
      this.statusDisplay?.entityType?.toLowerCase() ??
      'form'
    )
  }

  protected readonly errors = computed<FormSubmissionError[]>(
    () => this.statusDisplay?.state()?.errors() ?? []
  )
  protected readonly primary = computed(() =>
    this.statusDisplay?.dismissed() ? undefined : this.errors().at(0)
  )
  protected readonly extraCount = computed(() =>
    Math.max(0, this.errors().length - 1)
  )
  // a single failure shows its message (codes live in the popover chips);
  // multiple failures defer to the popover entirely
  protected readonly label = computed(() => {
    const e = this.primary()
    if (!e) return ''
    if (this.extraCount() > 0) {
      const noun = this.noun
      return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} submission failed, review error details.`
    }
    return e.message
  })

  // the title tag: a single error wears its category's chip style, several
  // wear the field-error red
  protected readonly tagLabel = computed(() => {
    const e = this.primary()
    if (!e) return ''
    return this.extraCount() > 0
      ? '[Multiple Errors]'
      : `[${categoryName(e.category)} Error]`
  })
  protected readonly tagColor = computed(() => {
    const e = this.primary()
    if (!e || this.extraCount() > 0) return undefined
    return categoryColor(e.category)
  })

  protected readonly okLabel = computed(
    () => `All required fields provided, ${this.noun} may be submitted.`
  )

  // like the error label: a single issue shows itself, several defer to
  // the popover
  protected readonly issueLabel = computed(() =>
    describeFieldIssues(this.readiness()?.issues ?? [])
  )

  // popover header controls: expand/collapse every panel, copy the details
  protected readonly expandAll = signal(false)
  protected readonly copied = signal(false)

  protected copyAll(): void {
    navigator.clipboard
      ?.writeText(submissionErrorsText(this.errors()))
      .then(() => {
        this.copied.set(true)
        setTimeout(() => this.copied.set(false), 2000)
      })
  }
}
