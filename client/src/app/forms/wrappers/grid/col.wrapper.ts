import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core'
// the zorro flavor adds hideLabel/hideRequiredMarker, which form-field reads
import { FormlyFieldProps } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzRowDirective } from 'ng-zorro-antd/grid'

// zorro 22 removed the grid EmbeddedProperty export; shape retained here
type EmbeddedProperty = {
  span?: number
  pull?: number
  push?: number
  offset?: number
  order?: number
}

export type CvcColConfig = {
  span?: number | null
  flex?: string | number | null
  offset?: number | null
  xs?: number | EmbeddedProperty | null
  sm?: number | EmbeddedProperty | null
  md?: number | EmbeddedProperty | null
  lg?: number | EmbeddedProperty | null
  xl?: number | EmbeddedProperty | null
  xxl?: number | EmbeddedProperty | null
}

export interface CvcColWrapperProps extends FormlyFieldProps {
  /** this field's own nz-col sizing; defaults to a full-width column */
  col?: CvcColConfig
}

/**
 * Wraps one field in an nz-col sized by that field's own props.col —
 * never by a parent addressing it by position, which is what made
 * form-row's *Indexed modes fragile (signal-boundary plan §8.2).
 */
@Component({
  selector: 'cvc-col-wrapper',
  template: `
    <nz-col
      [nzSpan]="col.span ?? null"
      [nzFlex]="col.flex ?? null"
      [nzOffset]="col.offset ?? null"
      [nzXs]="col.xs ?? null"
      [nzSm]="col.sm ?? null"
      [nzMd]="col.md ?? null"
      [nzLg]="col.lg ?? null"
      [nzXl]="col.xl ?? null"
      [nzXXl]="col.xxl ?? null">
      <ng-container #fieldComponent></ng-container>
    </nz-col>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  // NzColDirective resolves its row with inject(..., { host: true }), which
  // stops at this wrapper's boundary and silently drops the gutter padding;
  // re-provide the ancestor row so the col can reach it
  viewProviders: [
    {
      provide: NzRowDirective,
      useFactory: () =>
        inject(NzRowDirective, { optional: true, skipSelf: true }),
    },
  ],
})
export class CvcColWrapper extends FieldWrapper<
  FormlyFieldConfig<CvcColWrapperProps>
> {
  get col(): CvcColConfig {
    return this.props.col ?? { span: 24 }
  }
}
