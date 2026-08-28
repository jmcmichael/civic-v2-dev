import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { FormFieldIssue } from '@app/forms/utilities/form-field-issues'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/** Pre-submit form state, provided by the submit button's field type */
export interface FormReadiness {
  readonly valid: boolean
  readonly issues: FormFieldIssue[]
}

const CATEGORY_COLORS: Record<FormSubmissionError['category'], string> = {
  graphql: 'volcano',
  network: 'orange',
  apollo: 'purple',
  cache: 'geekblue',
  code: 'red',
}

/**
 * Compact submit-state indicator, rendered wherever a form shows submit
 * state: the form card's header extra (as a tag) and the footer button bar
 * (as a small alert — `variant="alert"`). A submit failure shows an error
 * alert whose popover lists every error as a collapse panel — category
 * chip, code and message in the header; full message, meta rows, a JSON
 * tree or raw log, and copy affordances in the body. With no failure
 * displayed, the alert variant reports the `readiness` input instead: an
 * info alert whose popover lists the fields blocking submission, or a
 * success alert once the form is ready.
 *
 * Reads state from the nearest cvc-form-submission-status-display ancestor,
 * so it can be dropped into any template inside one without wiring inputs
 * through formly configs. Renders nothing outside one, or without errors.
 */
@Component({
  selector: 'cvc-form-error-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgxJsonViewerModule,
    NzAlertModule,
    NzButtonModule,
    NzCollapseModule,
    NzIconModule,
    NzPopoverModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './form-error-tag.component.html',
  styleUrl: './form-error-tag.component.less',
})
export class CvcFormErrorTagComponent {
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

  protected readonly okLabel = computed(
    () => `All required fields provided, ${this.noun} may be submitted.`
  )

  // like the error label: a single issue shows itself, several defer to
  // the popover
  protected readonly issueLabel = computed(() => {
    const issues = this.readiness()?.issues ?? []
    if (issues.length === 0) return 'Form is not ready to submit.'
    if (issues.length === 1) return `${issues[0].label}: ${issues[0].reason}.`
    return `${issues.length} fields need attention before submitting.`
  })

  protected categoryColor(category: FormSubmissionError['category']): string {
    return CATEGORY_COLORS[category]
  }

  // header controls: expand/collapse every panel, copy the full details.
  // driving the nzActive input closes manually-opened panels too — the
  // panel's linked signal resets whenever the input changes
  protected readonly expandAll = signal(false)
  protected readonly copied = signal(false)

  protected copyAll(): void {
    navigator.clipboard?.writeText(this.detailsText()).then(() => {
      this.copied.set(true)
      setTimeout(() => this.copied.set(false), 2000)
    })
  }

  protected errorBlock(e: FormSubmissionError): string {
    const head = `[${e.category}${e.code ? ` ${e.code}` : ''}] ${e.message}`
    const meta = (e.meta ?? []).map((m) => `${m.label}: ${m.value}`)
    return [head, ...meta, e.log].filter(Boolean).join('\n')
  }

  protected readonly detailsText = computed(() =>
    this.errors()
      .map((e) => this.errorBlock(e))
      .join('\n\n---\n\n')
  )
}
