import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/** One field state, rendered as a chip tinted like the field box itself. */
interface CvcFieldLegendItem {
  /** doubles as the CSS class, matching the wrapper's state classes */
  readonly state: 'required' | 'optional' | 'ok' | 'error'
  readonly label: string
  readonly hint: string
  /**
   * The ant glyph for states that have one. The two resting states draw a
   * bare circle in CSS instead — ant has no such glyph — filled for
   * `required`, open for `optional`, exactly as the field labels do.
   */
  readonly icon?: 'check-circle' | 'exclamation-circle'
}

/**
 * Explains the form-field label states, inline in the form card's header.
 *
 * Rendered as two lines that each stay whole: given room they sit side by
 * side, otherwise they stack. That is why there is no narrow-screen popover —
 * measured down to a 320px card the legend still fits without overflowing.
 *
 * Colours come from themes/field-states.less, the same variables the
 * form-field wrapper paints with, so the legend cannot drift from the fields
 * it describes.
 */
@Component({
  selector: 'cvc-form-legend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule, NzTagModule, NzTooltipModule, NzTypographyModule],
  templateUrl: './form-legend.component.html',
  styleUrl: './form-legend.component.less',
})
export class CvcFormLegendComponent {
  /**
   * Two lines, each pairing the states that answer the same question: whether
   * what is in the field passes, and whether it had to be filled at all.
   */
  protected readonly lines: readonly (readonly CvcFieldLegendItem[])[] = [
    [
      {
        state: 'ok',
        label: 'OK',
        hint: 'Filled in and accepted',
        icon: 'check-circle',
      },
      {
        state: 'error',
        label: 'Error',
        hint: 'Required and empty, or filled in incorrectly',
        icon: 'exclamation-circle',
      },
    ],
    [
      {
        state: 'required',
        label: 'Required',
        hint: 'Must be filled in before the form can be submitted',
      },
      {
        state: 'optional',
        label: 'Optional',
        hint: 'May be left empty',
      },
    ],
  ]
}
