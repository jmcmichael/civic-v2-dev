import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/**
 * Compact submit-error indicator, rendered wherever a form shows submit
 * state: the form card's header extra (as a tag) and the footer button bar
 * (as a small alert — `variant="alert"`). Displays the first error's
 * category, code and short name; clicking it opens a popover listing every
 * error with its full message and details.
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
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
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

  private modal = inject(NzModalService)
  private readonly detailsTpl = viewChild<TemplateRef<void>>('detailsTpl')

  protected errorBlock(e: FormSubmissionError): string {
    const head = `[${e.category}${e.code ? ` ${e.code}` : ''}] ${e.message}`
    return [head, ...(e.details ?? []), e.log].filter(Boolean).join('\n')
  }

  protected readonly detailsText = computed(() =>
    this.errors()
      .map((e) => this.errorBlock(e))
      .join('\n\n---\n\n')
  )

  protected openDetails(event: MouseEvent): void {
    // the whole alert is the popover trigger; the details button is not
    event.stopPropagation()
    const content = this.detailsTpl()
    if (!content) return
    this.modal.create({
      nzTitle: 'Submission Error Details',
      nzContent: content,
      nzFooter: null,
      nzWidth: 720,
    })
  }
}
