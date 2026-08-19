import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import { InputEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { CvcEnumOption } from '../entity-table.types'
import { groupEnumOptions } from '../enum-filter-options'

/**
 * An enum filter that always collapses to a single glyph — the narrow
 * attribute columns' control (`CvcEnumFilter.control: 'icon-select'`),
 * recovering the legacy browse tables' always-visible filter selects
 * (`nz-select nzAllowClear nzPlaceHolder="All"`) in their icon-forward
 * form:
 *
 * - nothing selected: the 'All' prompt, standing in for every value
 * - open: the standard option list — each value's civic icon plus its
 *   label, `group`ed options under their headings — in a dropdown wider
 *   than the trigger
 * - selected: only the value's icon (its label in a tooltip), with
 *   ng-zorro's clear control (a circle-x, shown whenever a value is set)
 *   restoring All
 *
 * No arrow: at attribute-column widths the prompt itself is the entire
 * affordance. `showIcons: false` enums collapse to each option's
 * `shortLabel` instead (the AMP category's 'IA', as its cells render),
 * falling back to the full label.
 *
 * Option loops track by index, not value: a grouped enum may list the same
 * value under several headings (significance's NA).
 */
@Component({
  selector: 'cvc-enum-icon-select',
  imports: [FormsModule, NzIconModule, NzSelectModule, NzTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    nz-select {
      width: 100%;
    }
    /* only the glyph shows collapsed; trim the chrome to fit 40px columns */
    :host ::ng-deep .ant-select-selector {
      padding: 0 4px !important;
    }
    :host ::ng-deep .ant-select-selection-item,
    :host ::ng-deep .ant-select-selection-placeholder {
      text-align: center;
    }
    /* the clear control shows whenever a value is set, not only on hover —
       at attribute-column widths a hover-only reveal reads as no
       affordance at all */
    :host ::ng-deep .ant-select-clear {
      opacity: 1;
    }
  `,
  template: `
    <nz-select
      nzSize="small"
      nzAllowClear
      nzPlaceHolder="All"
      [nzShowArrow]="false"
      [nzDropdownMatchSelectWidth]="false"
      [nzCustomTemplate]="selectedTpl"
      [ngModel]="selected()"
      (ngModelChange)="selectedChange.emit($event ?? null)">
      @for (group of groups(); track $index) {
        @if (group.title) {
          <nz-option-group [nzLabel]="group.title">
            @for (option of group.options; track $index) {
              <nz-option
                nzCustomContent
                [nzValue]="option.value"
                [nzLabel]="option.label">
                @if (showIcons()) {
                  <span
                    nz-icon
                    [nzType]="iconName(option.value)"></span>
                }
                {{ option.label }}
              </nz-option>
            }
          </nz-option-group>
        } @else {
          @for (option of group.options; track $index) {
            <nz-option
              nzCustomContent
              [nzValue]="option.value"
              [nzLabel]="option.label">
              @if (showIcons()) {
                <span
                  nz-icon
                  [nzType]="iconName(option.value)"></span>
              }
              {{ option.label }}
            </nz-option>
          }
        }
      }
    </nz-select>

    <ng-template
      #selectedTpl
      let-option>
      @if (showIcons()) {
        <span
          nz-icon
          [nzType]="iconName(option.nzValue)"
          nz-tooltip
          [nzTooltipTitle]="option.nzLabel"></span>
      } @else {
        <span
          class="short-label"
          nz-tooltip
          [nzTooltipTitle]="option.nzLabel"
          >{{ shortLabelFor(option.nzValue) ?? option.nzLabel }}</span
        >
      }
    </ng-template>
  `,
})
export class CvcEnumIconSelectComponent {
  readonly options = input.required<ReadonlyArray<CvcEnumOption<unknown>>>()
  readonly selected = input<unknown>(null)
  /** false for enums with no civic-* icon set; see CvcEnumFilter.showIcons */
  readonly showIcons = input<boolean>(true)

  readonly selectedChange = output<unknown>()

  protected readonly groups = computed(() => groupEnumOptions(this.options()))

  /** the value's civic icon, by the same derivation the attribute tags use */
  protected iconName(value: unknown): string {
    return evidenceEnumDisplay(value as InputEnum, 'icon-name')
  }

  /** the value's compact collapsed rendering — see CvcEnumOption.shortLabel */
  protected shortLabelFor(value: unknown): string | undefined {
    return this.options().find((option) => option.value === value)?.shortLabel
  }
}
