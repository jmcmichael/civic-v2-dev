import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'

export type FormCardOptions = {
  title?: string
  size?: 'default' | 'small'
  /**
   * Show the field-status legend in the card header. Defaults to true for
   * full-size cards and false for small ones, so a form's outer card explains
   * its fields once without every nested sub-card repeating it.
   */
  showLegend?: boolean
}

export interface CvcFormCardWrapperProps extends FormlyFieldProps {
  formCardOptions?: FormCardOptions
  /**
   * One line shown in the card header in place of the title — the page
   * header already names the entity and action, so the card leads with
   * what to do instead of repeating it.
   */
  formInstructions?: string
}

const defaultWrapperOptions: FormCardOptions = {
  size: 'default',
}

@Component({
  selector: 'cvc-form-card',
  templateUrl: './form-card.wrapper.html',
  styleUrls: ['./form-card.wrapper.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcFormCardWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFormCardWrapperProps>>
  implements OnInit
{
  private destroyRef = inject(DestroyRef)
  private statusDisplay = inject(CvcFormSubmissionStatusDisplayComponent, {
    optional: true,
  })

  wrapperOptions: FormCardOptions = { ...defaultWrapperOptions }

  get errorState() {
    return this.showError ? 'error' : ''
  }

  /** nested sub-cards are rendered small; only the outer card explains states */
  get showLegend(): boolean {
    return (
      this.wrapperOptions.showLegend ?? this.wrapperOptions.size !== 'small'
    )
  }

  /**
   * Fields marked `props.formFooter` (the cancel/submit row) render in the
   * card's actions area, pinned below the scrolling body; the rest render
   * in the body.
   */
  get footerFields(): FormlyFieldConfig[] {
    return (
      this.field.fieldGroup?.filter((f) => f.props?.['formFooter'] === true) ??
      []
    )
  }

  get bodyFields(): FormlyFieldConfig[] {
    return (
      this.field.fieldGroup?.filter((f) => f.props?.['formFooter'] !== true) ??
      []
    )
  }

  /** a card with a pinned footer fills the page; its body scrolls */
  get fullPage(): boolean {
    return this.footerFields.length > 0
  }

  ngOnInit(): void {
    if (this.props.formCardOptions) {
      this.wrapperOptions = {
        ...this.wrapperOptions,
        ...this.props.formCardOptions,
      }
    }
    // the display cannot see the form (it only projects it); the wrapper,
    // handed the form by formly, reports the edit that dismisses the failure
    const display = this.statusDisplay
    if (display) {
      this.form.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if ((display.state()?.errors().length ?? 0) > 0) {
            display.dismissed.set(true)
          }
        })
    }
  }
}
