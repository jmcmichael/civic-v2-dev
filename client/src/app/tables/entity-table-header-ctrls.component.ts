import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  input,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { map } from 'rxjs/operators'

/**
 * The table card's action bar: one compact button group holding the
 * host-projected actions (`[cvcTableCtrlButton]` — the facades'
 * Download buttons) and the table's own Filters and Settings popover
 * triggers. The popovers' CONTENT stays the table's: it arrives as
 * TemplateRefs, so every binding inside them keeps resolving against
 * the table component.
 *
 * Buttons carry icon + label, and the labels drop at narrow viewports
 * (CDK Breakpoints XSmall/Small) — including projected ones, which opt
 * in by wrapping their text in `.ctrl-label` (see
 * cvc-table-downloader). This component is the template for pulling
 * the remaining per-table toolbar controls into one vocabulary.
 */
@Component({
  selector: 'cvc-entity-table-header-ctrls',
  imports: [NzButtonModule, NzIconModule, NzPopoverModule, NzSpaceModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.labels-hidden]': '!showLabels()',
  },
  styles: `
    :host {
      display: inline-block;
    }
    .ctrl-label {
      margin-left: 6px;
    }
    /* icon-only mode below the sm breakpoint — projected buttons' labels
       (the downloader's) hide through the same class */
    :host.labels-hidden ::ng-deep .ctrl-label {
      display: none;
    }
    /* Projected buttons join the compact group by CSS: ng-zorro's compact
       item classes travel by DI, which follows the logical tree — the
       facade, not this projection site — so they never reach projected
       content. The projected button squares its trailing corner and
       collapses the shared border; the first native button squares its
       leading one. */
    /* the projected component's host leaves the flex layout entirely —
       its button becomes the compact row's direct flex item */
    :host ::ng-deep nz-space-compact > [cvcTableCtrlButton] {
      display: contents;
    }
    :host ::ng-deep nz-space-compact > [cvcTableCtrlButton] .ant-btn {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      margin-right: -1px;
    }
    :host ::ng-deep nz-space-compact > [cvcTableCtrlButton] + button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `,
  template: `
    <!-- nzSize here, not (only) on the buttons: the compact group sizes
         its items by DI, overriding their own nzSize -->
    <nz-space-compact nzSize="small">
      <ng-content select="[cvcTableCtrlButton]" />
      <button
        nz-button
        nz-popover
        type="button"
        nzType="default"
        nzSize="small"
        data-testid="table-filters-trigger"
        [nzPopoverTitle]="filtersTitle()"
        [nzPopoverContent]="filtersContent()"
        nzPopoverTrigger="click">
        <span
          nz-icon
          nzType="filter"
          nzTheme="fill"
          [class.filters-applied]="filtersApplied()"></span>
        <span class="ctrl-label">Filters</span>
      </button>
      <button
        nz-button
        nz-popover
        type="button"
        nzType="default"
        nzSize="small"
        data-testid="column-prefs-trigger"
        [nzPopoverTitle]="settingsTitle()"
        [nzPopoverContent]="settingsContent()"
        nzPopoverTrigger="click">
        <span
          nz-icon
          nzType="setting"
          nzTheme="outline"></span>
        <span class="ctrl-label">Settings</span>
      </button>
    </nz-space-compact>
  `,
})
export class CvcEntityTableHeaderCtrlsComponent {
  /** lights the funnel glyph when any filter is applied */
  readonly filtersApplied = input<boolean>(false)
  readonly filtersTitle = input<TemplateRef<void> | string>()
  readonly filtersContent = input<TemplateRef<void>>()
  readonly settingsTitle = input<string>()
  readonly settingsContent = input<TemplateRef<void>>()

  private readonly breakpoints = inject(BreakpointObserver)

  /** labels show above the sm breakpoint; below it the bar is icon-only */
  readonly showLabels = toSignal(
    this.breakpoints
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((state) => !state.matches)),
    { initialValue: true }
  )
}
