import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  Signal,
  inject,
} from '@angular/core'
import { CvcFormErrorAlertComponent } from '@app/forms/components/form-error-alert/form-error-alert.component'
import {
  createFormReadiness,
  readinessSnapshot,
} from '@app/forms/utilities/form-readiness'
import { CvcFormActionsRowWrapper } from '@app/forms/wrappers/form-actions-row/form-actions-row.wrapper'
import { FieldType, FormlyConfig } from '@ngx-formly/core'
import { Apollo } from 'apollo-angular'

/**
 * The footer's middle column: what the form has to say about itself before
 * it is submitted — the fields still blocking it, a ready-to-submit preview,
 * or a submission failure.
 *
 * Keyless: it reports on the form rather than editing it.
 *
 * Readiness comes from the actions row when it is inside one, so the row's
 * three columns share one derivation. Standing alone it derives its own,
 * which is what lets the alert be used outside a footer at all — the state
 * used to live inside the submit button and could not be had without it.
 */
@Component({
  selector: 'cvc-form-notifications',
  template: `
    <cvc-form-error-alert
      variant="alert"
      [readiness]="readiness()" />
  `,
  // the alert's own host is inline-block, sized to its message; here it is a
  // column and fills the width the row leaves it
  styles: [
    `
      :host,
      cvc-form-error-alert {
        display: block;
      }
    `,
  ],
  imports: [CvcFormErrorAlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CvcFormNotificationsComponent
  extends FieldType<any>
  implements OnInit
{
  private row = inject(CvcFormActionsRowWrapper, { optional: true })
  private injector = inject(Injector)
  private apollo = inject(Apollo)
  private formlyConfig = inject(FormlyConfig)

  readiness!: Signal<ReturnType<ReturnType<typeof readinessSnapshot>>>

  ngOnInit(): void {
    this.readiness =
      this.row?.readinessValue ??
      readinessSnapshot(
        createFormReadiness(this.field, this.form, {
          injector: this.injector,
          apollo: this.apollo,
          formlyConfig: this.formlyConfig,
        })
      )
  }
}
