import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewEncapsulation,
} from '@angular/core'
import {
  FieldWrapper,
  FormlyFieldConfig,
  FormlyFieldProps,
} from '@ngx-formly/core'

export interface CvcRowWrapperProps extends FormlyFieldProps {
  /** nz-row gutter: horizontal, or [horizontal, vertical] */
  row?: { gutter?: number | [number, number] }
}

/**
 * Renders a field group as an nz-row. Owns only the gutter; each child
 * field carries its own column sizing via the `col` wrapper. Successor to
 * form-row's six broadcast layout modes (signal-boundary plan §8.1).
 */
@Component({
  selector: 'cvc-row-wrapper',
  template: `
    <nz-row
      class="cvc-form-row"
      [nzGutter]="gutter">
      <ng-container #fieldComponent></ng-container>
    </nz-row>
  `,
  // formly interposes formly-group/formly-field elements (and the col
  // wrapper adds its own host) between the row and its nz-cols; without
  // display: contents those boxes are the flex items and every col wraps
  // onto its own line. None (not ::ng-deep) because the inserted views never
  // receive this component's scoping attribute; the .cvc-form-row class
  // keeps the rule from reaching foreign rows
  styles: [
    `
      .cvc-form-row > formly-group,
      .cvc-form-row > formly-group > formly-field,
      .cvc-form-row > formly-group > formly-field > cvc-col-wrapper {
        display: contents;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcRowWrapper extends FieldWrapper<
  FormlyFieldConfig<CvcRowWrapperProps>
> {
  get gutter(): number | [number, number] {
    return this.props.row?.gutter ?? [8, 8]
  }

  @HostBinding('style.display') display = 'block'

  // stacked rows space themselves by half their vertical gutter, matching
  // the horizontal gutter between cols; a zero vertical gutter opts out
  // (single-line forms like mp-finder)
  @HostBinding('style.margin-top') get topMargin(): string {
    const g = this.gutter
    if (Array.isArray(g)) return g[1] > 0 ? g[1] / 2 + 'px' : '0'
    return g > 0 ? g + 'px' : '0'
  }
}
