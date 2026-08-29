import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import { InputEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
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
 *
 * With `multiple`, items carry checkboxes and clicks build a draft that only
 * reaches the table on OK — the server ORs the values, so a partially built
 * selection would query for something the curator never asked for. The draft
 * reseeds from `selected` whenever the dropdown opens, so abandoning a
 * selection by clicking away discards it.
 */
@Component({
  selector: 'cvc-enum-filter-menu',
  imports: [
    NgTemplateOutlet,
    NzButtonModule,
    NzCheckboxModule,
    NzDropdownModule,
    NzIconModule,
    NzMenuModule,
    NzSpaceModule,
    NzTooltipModule,
  ],
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
                <ng-container
                  [ngTemplateOutlet]="item"
                  [ngTemplateOutletContext]="{ $implicit: option }" />
              }
            </ul>
          </li>
        } @else {
          @for (option of group.options; track $index) {
            <ng-container
              [ngTemplateOutlet]="item"
              [ngTemplateOutletContext]="{ $implicit: option }" />
          }
        }
      }
      <li style="display: flex; gap: 4px; padding: 3px">
        <!-- split reset: the button clears this column; its reveal opens
             the reset-all action (the table has no toolbar reset button) -->
        <nz-space-compact
          nzBlock
          nzSize="small"
          style="flex: 1 1 auto">
          <button
            nz-button
            nzType="default"
            nzSize="small"
            style="flex: 1 1 auto"
            [disabled]="!canReset()"
            (click)="reset()">
            <span
              nz-icon
              nzType="retweet"
              nzTheme="outline"></span>
            Reset
          </button>
          <button
            nz-button
            nzType="default"
            nzSize="small"
            data-testid="reset-reveal"
            nz-dropdown
            [nzDropdownMenu]="resetMenu"
            nzPlacement="bottomRight">
            <span
              nz-icon
              nzType="down"
              nzTheme="outline"></span>
          </button>
        </nz-space-compact>
        <nz-dropdown-menu #resetMenu="nzDropdownMenu">
          <ul nz-menu>
            <li
              nz-menu-item
              data-testid="reset-all"
              nz-tooltip
              nzTooltipTitle="Reset all table filters"
              nzTooltipPlacement="right"
              (click)="resetAll.emit()">
              Reset all
            </li>
          </ul>
        </nz-dropdown-menu>
        @if (multiple()) {
          <button
            nz-button
            nzType="primary"
            nzSize="small"
            data-testid="filter-apply"
            style="flex: none"
            (click)="apply()">
            OK
          </button>
        }
      </li>
      <!-- declared inside the menu on purpose: nz-menu-item resolves
           MenuService from where a template is declared, not where it is
           stamped, and outside this ul there is no menu to resolve -->
      <ng-template
        #item
        let-option>
        <li
          nz-menu-item
          [nzSelected]="isSelected(option.value)"
          [attr.aria-label]="option.label"
          (click)="choose(option.value)">
          @if (multiple()) {
            <!-- display only: the menu item owns the click, so the box must
                 not answer one of its own -->
            <label
              nz-checkbox
              style="pointer-events: none"
              [nzChecked]="isSelected(option.value)"></label>
          }
          @if (showIcons()) {
            <span
              nz-icon
              [nzType]="iconName(option.value)"></span>
          }
          {{ option.label }}
        </li>
      </ng-template>
    </ul>
  `,
})
export class CvcEnumFilterMenuComponent {
  readonly options = input.required<ReadonlyArray<CvcEnumOption<unknown>>>()
  readonly selected = input<unknown>(null)
  /** false for enums with no civic-* icon set; see CvcEnumFilter.showIcons */
  readonly showIcons = input<boolean>(true)
  /** several values at once, ORed by the server; see CvcEnumFilter.multiple */
  readonly multiple = input<boolean>(false)
  /** the host trigger's visibility, which reseeds the draft on each open */
  readonly open = input<boolean>(false)

  /** a scalar in single mode; a non-empty array or null in multiple */
  readonly selectedChange = output<unknown>()

  /** reset EVERY table filter, not just this column's — see the split
   * reset button; the host table wires this to its onResetFilters() */
  readonly resetAll = output<void>()

  protected readonly groups = computed(() => groupEnumOptions(this.options()))

  // reseeding on `open` as well as `selected` is what discards an abandoned
  // selection: reopening the dropdown starts from what the table is filtering
  private readonly draft = linkedSignal<
    { selected: unknown; open: boolean },
    unknown[]
  >({
    source: () => ({ selected: this.selected(), open: this.open() }),
    computation: ({ selected }) =>
      Array.isArray(selected)
        ? [...selected]
        : selected == null
          ? []
          : [selected],
  })

  protected readonly canReset = computed(() =>
    this.multiple() ? this.draft().length > 0 : this.selected() !== null
  )

  protected isSelected(value: unknown): boolean {
    return this.multiple()
      ? this.draft().includes(value)
      : this.selected() === value
  }

  protected choose(value: unknown): void {
    if (!this.multiple()) {
      this.selectedChange.emit(value)
      return
    }
    const next = new Set(this.draft())
    if (!next.delete(value)) next.add(value)
    this.draft.set([...next])
  }

  /** commit the draft; an empty one clears the filter */
  protected apply(): void {
    const values = this.draft()
    this.selectedChange.emit(values.length ? values : null)
  }

  protected reset(): void {
    this.draft.set([])
    this.selectedChange.emit(null)
  }

  /** the value's civic icon, by the same derivation the attribute tags use */
  protected iconName(value: unknown): string {
    return evidenceEnumDisplay(value as InputEnum, 'icon-name')
  }
}
