import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import {
  categoryColor,
  errorBlock,
} from '@app/components/app/error-list/error-categories'
import { FormSubmissionError } from '@app/core/utilities/submission-errors'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

/**
 * Categorized display of submission errors, shared by every error surface:
 * category chip, code tag, message and a copy affordance per error, with
 * toggleable details (meta rows, a JSON tree or raw log). Two modes —
 * 'collapse' renders accordion panels (the form footer alert's popover),
 * 'list' renders nz-list items with an explicit details toggle (the
 * app-level error modal).
 */
@Component({
  selector: 'cvc-error-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NgxJsonViewerModule,
    NzButtonModule,
    NzCollapseModule,
    NzIconModule,
    NzListModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './error-list.component.html',
  styleUrl: './error-list.component.less',
})
export class CvcErrorListComponent {
  readonly errors = input.required<FormSubmissionError[]>()
  readonly mode = input<'collapse' | 'list'>('collapse')
  /** open every item; toggling it discards per-item toggles */
  readonly expandAll = input(false)

  protected readonly categoryColor = categoryColor
  protected readonly errorBlock = errorBlock

  // list mode stores per-item flips against the base state, so the
  // expand-all switch always wins when it changes
  private readonly flipped = linkedSignal<boolean, ReadonlySet<number>>({
    source: this.expandAll,
    computation: () => new Set<number>(),
  })

  protected isOpen(index: number): boolean {
    const base = this.expandAll() || this.errors().length === 1
    return this.flipped().has(index) ? !base : base
  }

  protected toggle(index: number): void {
    const next = new Set(this.flipped())
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    this.flipped.set(next)
  }
}
