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
    NzPopoverModule,
    NzSpinModule,
    NzTagModule,
    NzTypographyModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
      {{ display() }}
    </nz-tag>

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
    }
    .count-tag {
      width: 100%;
      margin-inline-end: 0;
      text-align: right;
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
