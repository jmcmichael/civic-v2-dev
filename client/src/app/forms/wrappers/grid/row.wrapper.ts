import { ChangeDetectionStrategy, Component } from '@angular/core'
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
    <nz-row [nzGutter]="props.row?.gutter ?? [8, 8]">
      <ng-container #fieldComponent></ng-container>
    </nz-row>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcRowWrapper extends FieldWrapper<
  FormlyFieldConfig<CvcRowWrapperProps>
> {}
