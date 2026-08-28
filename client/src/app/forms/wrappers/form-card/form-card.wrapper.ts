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
   * Show the intro row (form instructions + field-state legend) and the
   * header error slot. Defaults to true for full-size cards and false for
   * small ones, so a form's outer card explains its fields once without
   * every nested sub-card repeating it.
   */
  showLegend?: boolean
}

export interface CvcFormCardWrapperProps extends FormlyFieldProps {
  formCardOptions?: FormCardOptions
  /** a couple of lines shown above the form, beside the field-state legend */
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
