import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

const CATEGORY_COLORS: Record<FormSubmissionError['category'], string> = {
  graphql: 'volcano',
  network: 'orange',
  apollo: 'purple',
  cache: 'geekblue',
  code: 'red',
}

/**
 * Compact submit-error indicator, rendered wherever a form shows submit
 * state: the form card's header extra (as a tag) and the footer button bar
 * (as a small alert — `variant="alert"`). Displays the first error's
 * category, code and short name; clicking it opens a popover listing every
 * error as a collapse panel — category chip, code and message in the
 * header; full message, meta rows, a JSON tree or raw log, and copy
 * affordances in the body.
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

  private statusDisplay = inject(CvcFormSubmissionStatusDisplayComponent, {
    optional: true,
  })

  protected readonly errors = computed<FormSubmissionError[]>(
    () => this.statusDisplay?.state()?.errors() ?? []
  )
  protected readonly primary = computed(() =>
    this.statusDisplay?.dismissed() ? undefined : this.errors().at(0)
  )
  protected readonly extraCount = computed(() =>
    Math.max(0, this.errors().length - 1)
  )
  // the full message: both variants stretch to the space available and
  // their CSS ellipsis trims to what actually fits
  protected readonly label = computed(() => {
    const e = this.primary()
    if (!e) return ''
    const code = e.code ? `${e.code}: ` : ''
    const more = this.extraCount() > 0 ? ` (+${this.extraCount()} more)` : ''
    return `${code}${e.message}${more}`
  })

  protected categoryColor(category: FormSubmissionError['category']): string {
    return CATEGORY_COLORS[category]
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
