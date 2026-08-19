import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { EntityTagRef, tagSpecFor } from './entity-tag-specs'
import { CvcTagListComponent } from './tag-list.component'

/**
 * A single "+N" tag standing in for a list too long to render, expanding to
 * the full list on hover.
 *
 * Icons and colours come from each ref's tag spec — the same source CvcTag
 * reads — so the collection and the tags it summarises cannot disagree.
 */
@Component({
  selector: 'cvc-collection-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTagModule,
    NzIconModule,
    NzPopoverModule,
    NzTypographyModule,
    CvcTagListComponent,
  ],
  templateUrl: './collection-tag.component.html',
  styleUrl: './collection-tag.component.less',
})
export class CvcCollectionTagComponent {
  readonly refs = input.required<EntityTagRef[]>()
  /**
   * Above this many entities, show a count and one icon instead of the
   * stacked per-entity icons. Defaults to 0 — count mode everywhere — per
   * review: the stacks drew attention away from the numbered tags. The
   * stacking (avatar-group pileup, see the .less) stays available for
   * callers that opt in.
   */
  readonly maxIcons = input<number>(0)
  /**
   * Suppress the count-mode entity icon — for an overflow chip appended to
   * visible tags of the same entity type, where repeating their icon says
   * nothing (the browse tables' entity-column overflows). Icon-stack mode
   * (`maxIcons`) is unaffected: its icons ARE the content.
   */
  readonly showIcon = input<boolean>(true)
  readonly emphasize = input<string | undefined>(undefined)
  readonly popover = input<boolean | undefined>(undefined)

  protected readonly icons = computed(() =>
    this.refs().map((ref) => tagSpecFor(ref.__typename))
  )

  protected readonly showAllIcons = computed(
    () => this.refs().length <= this.maxIcons()
  )
}
