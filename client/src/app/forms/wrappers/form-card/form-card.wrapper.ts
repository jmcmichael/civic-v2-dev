import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import { getEntityColor } from '@app/core/utilities/get-entity-color'
import { CvcFormTitle } from '@app/forms/messages/form-titles'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'

export type FormCardOptions = {
  title?: string
  /**
   * The entity this form edits, as an `EntityColors` key. The card head and
   * actions wash themselves in its color; a card that names no entity keeps
   * the neutral rule it always had.
   */
  entityType?: string
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
  /** one line shown above the form fields, in typography secondary */
  formInstructions?: string
  /**
   * The full-page card owns the page title, the nz-page-header it replaced
   * having carried it. Build it with `formTitle()` — it names a kind, not
   * an instance, so it is static config and needs no runtime patching.
   */
  formTitle?: CvcFormTitle
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
  host: { '[style.--cvc-entity-color]': 'entityColor' },
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

  /**
   * The entity's color, published to CSS so the head and actions strips can
   * wash themselves in it. Only the hex travels: the stylesheet derives the
   * pale end, so the two gradients cannot drift apart.
   */
  get entityColor(): string | null {
    const entityType =
      this.props.formTitle?.entityType ?? this.wrapperOptions.entityType
    return entityType ? getEntityColor(entityType) : null
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
