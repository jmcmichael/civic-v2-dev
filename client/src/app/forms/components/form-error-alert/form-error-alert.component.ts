import { NgTemplateOutlet } from '@angular/common'
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
  submissionErrorsText,
} from '@app/components/app/error-list/error-categories'
import { CvcErrorListComponent } from '@app/components/app/error-list/error-list.component'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcFormCardWrapper } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcCollectionTagComponent } from '@app/tags/collection-tag.component'
import { CvcTagComponent } from '@app/tags/entity-tag.component'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  describeFieldIssues,
  FormFieldIssue,
  FormFieldValue,
} from '@app/forms/utilities/form-field-issues'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/** Pre-submit form state, provided by the submit button's field type */
export interface FormReadiness {
  readonly valid: boolean
  readonly issues: FormFieldIssue[]
  /** the labeled model values for the ready alert's submission preview */
  readonly summary?: FormFieldValue[]
  /** JSON-safe formly config projection, for the preview's Copy Form Config */
  readonly formConfig?: () => unknown
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
    NgTemplateOutlet,
    CvcCollectionTagComponent,
    CvcErrorListComponent,
    CvcPipesModule,
    CvcTagComponent,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDropdownModule,
    NzIconModule,
    NzPopoverModule,
    NzSpaceModule,
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
  // the card wrapper's formTitle names the entity for the preview heading
  private cardWrapper = inject(CvcFormCardWrapper, { optional: true })

  protected readonly cardTitle = computed(
    () => this.cardWrapper?.props?.formTitle
  )

  protected get nounTitle(): string {
    const n = this.noun
    return n.charAt(0).toUpperCase() + n.slice(1)
  }

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

  // long-text preview rows expand in place
  private readonly expandedRows = signal<ReadonlySet<string>>(new Set())

  protected isRowExpanded(label: string): boolean {
    return this.expandedRows().has(label)
  }

  protected toggleRow(label: string): void {
    const next = new Set(this.expandedRows())
    if (next.has(label)) {
      next.delete(label)
    } else {
      next.add(label)
    }
    this.expandedRows.set(next)
  }

  // the preview header's copy buttons: everything copies JSON except the
  // query GQL, which is labelled as such
  protected readonly copiedMenu = signal<string | null>(null)

  protected readonly hasGraphqlPreview = computed(
    () => !!this.statusDisplay?.graphqlPreview
  )

  private flashCopied(menu: string, text: string): void {
    navigator.clipboard?.writeText(text).then(() => {
      this.copiedMenu.set(menu)
      setTimeout(() => this.copiedMenu.set(null), 2000)
    })
  }

  protected copyModel(): void {
    const rows = this.readiness()?.summary ?? []
    this.flashCopied(
      'model',
      JSON.stringify(
        Object.fromEntries(rows.map((r) => [r.key ?? r.label, r.value])),
        null,
        2
      )
    )
  }

  // label, key, value type, value, plus any outstanding issues per field
  protected copyDetails(): void {
    const issues = this.readiness()?.issues ?? []
    const rows = (this.readiness()?.summary ?? []).map((r) => ({
      label: r.label,
      key: r.key ?? '',
      type: r.valueType ?? '',
      value: r.value,
      description: r.description ?? '',
      issues: issues
        .filter((i) => i.label === r.label)
        .map((i) => i.reason)
        .join('; '),
    }))
    this.flashCopied('details', JSON.stringify(rows, null, 2))
  }

  protected copyFormConfig(): void {
    const config = this.readiness()?.formConfig?.()
    if (config === undefined) return
    this.flashCopied('config', JSON.stringify(config, null, 2))
  }

  protected copyVariables(): void {
    const request = this.statusDisplay?.graphqlPreview?.()
    if (!request) return
    this.flashCopied('variables', JSON.stringify(request.variables, null, 2))
  }

  // the printed document collapsed to one line
  protected copyQueryGql(): void {
    const request = this.statusDisplay?.graphqlPreview?.()
    if (!request) return
    this.flashCopied('query', request.query.replace(/\s+/g, ' ').trim())
  }

  protected copyAll(): void {
    navigator.clipboard
      ?.writeText(submissionErrorsText(this.errors()))
      .then(() => {
        this.copied.set(true)
        setTimeout(() => this.copied.set(false), 2000)
      })
  }
}
