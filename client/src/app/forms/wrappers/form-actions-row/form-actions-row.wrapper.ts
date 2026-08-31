import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  Signal,
  ViewEncapsulation,
  inject,
} from '@angular/core'
import {
  CvcFormReadiness,
  createFormReadiness,
  readinessSnapshot,
} from '@app/forms/utilities/form-readiness'
import { FieldWrapper, FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { Apollo } from 'apollo-angular'

/** How the row paints its panel and spaces its columns. */
export interface CvcFormActionsRowOptions {
  /** inset between the panel's border and the columns */
  padding?: string
  /** the panel's fill, before `opacity` is folded into it */
  background?: string
  borderColor?: string
  /**
   * 0–1. Folded into the fill rather than set on the element: an `opacity`
   * here would fade the buttons the panel exists to carry.
   */
  opacity?: number
  /** the gap between the columns */
  gutter?: number | [number, number]
}

export interface CvcFormActionsRowProps extends FormlyFieldProps {
  /** renders this row in the form card's actions strip rather than its body */
  formFooter?: boolean
  actionsRow?: CvcFormActionsRowOptions
}

const defaults: Required<CvcFormActionsRowOptions> = {
  padding: '3px',
  background: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.75)',
  opacity: 0.6175,
  gutter: [12, 8],
}

/**
 * A form's action row: one background panel around one nz-row of columns.
 *
 * Layout only — it composes whatever fields it is given (cancel,
 * notifications, submit) and implements none of them. Each child carries its
 * own column sizing via the `col` wrapper, exactly as under the plain `row`
 * wrapper this specializes.
 */
@Component({
  selector: 'cvc-form-actions-row',
  template: `
    <div
      class="cvc-form-actions-panel"
      [style.padding]="rowOptions.padding"
      [style.background]="panelFill"
      [style.border-color]="rowOptions.borderColor">
      <nz-row
        class="cvc-form-row"
        [nzGutter]="rowOptions.gutter">
        <ng-container #fieldComponent></ng-container>
      </nz-row>
    </div>
  `,
  styleUrl: './form-actions-row.wrapper.less',
  // the display:contents rules in the stylesheet reach views formly inserts,
  // which never receive this component's scoping attribute
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcFormActionsRowWrapper
  extends FieldWrapper<FormlyFieldConfig<CvcFormActionsRowProps>>
  implements OnInit
{
  private injector = inject(Injector)
  private apollo = inject(Apollo)
  private formlyConfig = inject(FormlyConfig)

  /**
   * The footer's submit readiness, derived once for the row rather than
   * once per control: the notifications column reports it and the submit
   * button gates on it. Both read it from here by injecting this wrapper.
   *
   * Assigned in ngOnInit because it derives from the form, which formly
   * attaches after construction.
   */
  readiness!: CvcFormReadiness
  /** the same state in the shape `cvc-form-error-alert` takes */
  readinessValue!: Signal<ReturnType<ReturnType<typeof readinessSnapshot>>>

  ngOnInit(): void {
    this.readiness = createFormReadiness(this.field, this.form, {
      injector: this.injector,
      apollo: this.apollo,
      formlyConfig: this.formlyConfig,
    })
    this.readinessValue = readinessSnapshot(this.readiness)
  }

  /**
   * Not `options`: FieldWrapper already declares one, of formly's own
   * `FormlyFormOptions` type, and shadowing it is a compile error.
   */
  get rowOptions(): Required<CvcFormActionsRowOptions> {
    return { ...defaults, ...this.props.actionsRow }
  }

  /**
   * The fill with its opacity folded in. color-mix rather than an rgba
   * rewrite so any CSS colour works as `background` — a hex, a named colour,
   * or a custom property carrying an entity's own hue.
   */
  get panelFill(): string {
    const { background, opacity } = this.rowOptions
    return `color-mix(in srgb, ${background} ${opacity * 100}%, transparent)`
  }
}
