import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import { InputEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { CvcEnumOption } from '../entity-table.types'
import { groupEnumOptions } from '../enum-filter-options'

/**
 * The dropdown behind an enum column's funnel icon: ng-zorro's default menu
 * items — the value's civic icon plus its plain label — and a reset. (Earlier
 * these rendered whole `cvc-attribute-tag`s; the tag chrome ate the menu's
 * room and is gone by design.) Options carrying a `group` render under
 * `nz-menu-group` headings (the assertions significance filter's five
 * contexts); ungrouped options render at the top level, both via
 * `groupEnumOptions`.
 *
 * Loops track by index, not value: a grouped enum may list the same value
 * under several headings (significance's NA), and every occurrence of the
 * selected value shows selected.
 */
@Component({
  selector: 'cvc-enum-filter-menu',
  imports: [NzButtonModule, NzIconModule, NzMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul nz-menu>
      @for (group of groups(); track $index) {
        @if (group.title) {
          <li
            nz-menu-group
            [nzTitle]="group.title">
            <ul>
              @for (option of group.options; track $index) {
                <li
                  nz-menu-item
                  [nzSelected]="selected() === option.value"
                  [attr.aria-label]="option.label"
                  (click)="selectedChange.emit(option.value)">
                  @if (showIcons()) {
                    <span
                      nz-icon
                      [nzType]="iconName(option.value)"></span>
                  }
                  {{ option.label }}
                </li>
              }
            </ul>
          </li>
        } @else {
          @for (option of group.options; track $index) {
            <li
              nz-menu-item
              [nzSelected]="selected() === option.value"
              [attr.aria-label]="option.label"
              (click)="selectedChange.emit(option.value)">
              @if (showIcons()) {
                <span
                  nz-icon
                  [nzType]="iconName(option.value)"></span>
              }
              {{ option.label }}
            </li>
          }
        }
      }
      <li style="padding: 3px">
        <button
          nz-button
          nzType="default"
          nzBlock
          nzSize="small"
          [disabled]="selected() === null"
          (click)="selectedChange.emit(null)">
          <span
            nz-icon
            nzType="retweet"
            nzTheme="outline"></span>
          Reset
        </button>
      </li>
    </ul>
  `,
})
export class CvcEnumFilterMenuComponent {
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
}
