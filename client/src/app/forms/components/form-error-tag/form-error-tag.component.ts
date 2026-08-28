import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { FormSubmissionError } from '@app/forms/utilities/form-mutation'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'

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
  imports: [NzAlertModule, NzTagModule, NzIconModule, NzPopoverModule],
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
}
