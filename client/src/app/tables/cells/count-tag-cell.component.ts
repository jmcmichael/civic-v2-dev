import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import {
  CvcPopoverContentResizeDirective,
  CvcTagListComponent,
  writeCachedEntity,
} from '@app/tags'
import { Maybe } from '@app/generated/civic.apollo.types'
import { Apollo } from 'apollo-angular'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverDirective, NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { take } from 'rxjs/operators'
import {
  CVC_COUNT_ENTITY_RESOLVER,
  CvcCountEntitiesResult,
} from '../count-entity-resolver'
import { CvcCountEntitiesRequest, CvcCountEntity } from '../entity-table.types'
import { formatCount } from '../format'

/** how many entities the popover shows; the footer names the remainder */
const POPOVER_PAGE = 10

/**
 * The `count-tag` cell: a full-width tag carrying the count, whose hover
 * popover discloses the counted entities themselves — given directly
 * (`items`, rows that already carry them) or fetched on first open through
 * the app's `CVC_COUNT_ENTITY_RESOLVER` (`request`). Without either (or
 * without a registered resolver) the tag is a plain count.
 *
 * Fetched seeds are written to the Apollo cache before the tags render
 * (`cvc-tag` reads the cache alone); the resize directive re-anchors the
 * overlay when the loaded list replaces the spinner.
 */
@Component({
  selector: 'cvc-count-tag-cell',
  imports: [
    CvcPopoverContentResizeDirective,
    CvcTagListComponent,
    NzIconModule,
    NzPopoverModule,
    NzSpinModule,
    NzTagModule,
    NzTypographyModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- a zero count is an absence, not a collection: no chip, no icon -->
    @if ((count() ?? 0) === 0) {
      <span
        class="zero-count"
        nz-typography
        nzType="secondary"
        >0</span
      >
    } @else {
      <nz-tag
        class="count-tag"
        [class.has-popover]="popoverEnabled()"
        nz-popover
        #popover="nzPopover"
        [nzPopoverContent]="
          popoverEnabled() && !suspended() ? content : undefined
        "
        nzPopoverPlacement="left"
        nzPopoverTrigger="hover"
        (nzPopoverVisibleChange)="onVisibleChange($event)">
        <span
          class="entity-count"
          nz-typography
          nzType="secondary">
          <strong>{{ display() }}</strong>
        </span>
        @if (icon(); as glyph) {
          <span
            class="entity-icon"
            nz-icon
            [nzType]="glyph"
            nzTheme="twotone"
            [nzTwotoneColor]="iconColor()"></span>
        }
      </nz-tag>
    }

    <ng-template #content>
      <div
        class="count-popover"
        cvcPopoverContentResize
        (cvcPopoverContentResize)="popoverRef()?.updatePosition()">
        @if (loading()) {
          <nz-spin nzSize="small" />
        } @else {
          <cvc-tag-list
            [refs]="shownRefs()"
            [fullWidth]="true" />
          @if (remainder(); as more) {
            <div
              class="count-popover-footer"
              nz-typography
              nzType="secondary">
              + {{ formatRemainder(more) }} more
            </div>
          }
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      /* the tag is the host's only content, and overflow-hidden moves an
         inline-block's baseline to its bottom margin edge — a live line
         box would add descender space under the tag, growing the 28px
         virtual rows. No line box, no gap. */
      line-height: 0;
      /* a content-sized chip, centered in its column like the tag-list
         overflow tags it mirrors */
      text-align: center;
    }
    /* The collection tag's [+][count][icon] chip, without the plus — the
       same metrics as collection-tag.component.less so count cells and
       tag-list overflow tags read as one vocabulary. */
    .count-tag {
      margin: 0;
      padding: 0;
      margin-inline-end: 0;
      /* a boundary transfer can squeeze the column to the 40px floor;
         the count clips rather than wrapping under the icon */
      white-space: nowrap;
      overflow: hidden;
      vertical-align: top;
    }
    .count-tag .entity-count,
    .count-tag .entity-icon {
      display: inline-block;
      line-height: 1;
    }
    .count-tag .entity-count {
      margin: -3px 0;
      padding: 3px 4px 3px 5px;
    }
    .count-tag .entity-icon {
      margin: -3px 1px -4px -1px;
      padding: 3px 3px 3px 0;
    }
    .zero-count {
      display: inline-block;
      line-height: 20px;
      vertical-align: top;
    }
    .count-tag.has-popover {
      cursor: help;
    }
    .count-popover {
      display: flex;
      flex-direction: column;
      row-gap: 2px;
      max-width: 280px;
    }
    .count-popover-footer {
      font-size: 12px;
      padding-top: 2px;
    }
  `,
})
export class CvcCountTagCellComponent {
  private readonly apollo = inject(Apollo)
  private readonly resolver = inject(CVC_COUNT_ENTITY_RESOLVER, {
    optional: true,
  })

  readonly count = input<Maybe<number>>()
  /** the column's entity glyph, shown before the count */
  readonly icon = input<Maybe<string>>()
  readonly iconColor = input<Maybe<string>>()
  /** entities the row already carries */
  readonly items = input<Maybe<ReadonlyArray<CvcCountEntity>>>()
  /** what to ask the resolver for, lazily on first open */
  readonly request = input<Maybe<CvcCountEntitiesRequest>>()
  /** true while the table scrolls; popovers stay closed */
  readonly suspended = input<boolean>(false)

  protected readonly popoverRef = viewChild('popover', {
    read: NzPopoverDirective,
  })

  protected readonly loading = signal(false)
  private readonly fetched = signal<Maybe<CvcCountEntitiesResult>>(undefined)
  private seeded = false

  protected readonly display = computed(() => formatCount(this.count()) ?? '')

  protected readonly popoverEnabled = computed(
    () =>
      (this.count() ?? 0) > 0 &&
      ((this.items()?.length ?? 0) > 0 || (!!this.request() && !!this.resolver))
  )

  private readonly entities = computed<ReadonlyArray<CvcCountEntity>>(
    () => this.items() ?? this.fetched()?.items ?? []
  )

  protected readonly shown = computed(() =>
    this.entities().slice(0, POPOVER_PAGE)
  )

  protected readonly shownRefs = computed(() =>
    this.shown().map((entity) => entity.ref)
  )

  protected formatRemainder(count: number): string {
    return formatCount(count) ?? String(count)
  }

  protected readonly remainder = computed(() => {
    const total = this.count() ?? this.fetched()?.total ?? 0
    return Math.max(0, total - this.shown().length)
  })

  protected onVisibleChange(open: boolean): void {
    if (!open) return

    const given = this.items()
    if (given?.length && !this.seeded) {
      this.seeded = true
      for (const entity of given) {
        if (entity.seed)
          writeCachedEntity(this.apollo, entity.ref.__typename, entity.seed)
      }
      return
    }

    const request = this.request()
    if (request && this.resolver && !this.fetched() && !this.loading()) {
      this.loading.set(true)
      this.resolver
        .resolve(request)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            for (const entity of result.items) {
              if (entity.seed)
                writeCachedEntity(
                  this.apollo,
                  entity.ref.__typename,
                  entity.seed
                )
            }
            this.fetched.set(result)
            this.loading.set(false)
          },
          error: () => this.loading.set(false),
        })
    }
  }
}
