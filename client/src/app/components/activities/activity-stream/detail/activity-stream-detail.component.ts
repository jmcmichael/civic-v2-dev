import { NgComponentOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  Type,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { CvcStreamState } from '@app/streams/stream-state'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { onlyCompleteData } from 'apollo-angular'
import { filter, map } from 'rxjs/operators'
import { ACTIVITY_DETAIL_REGISTRY } from '../activity-detail.registry'
import { ActivityStreamNode } from '../activity-stream.types'

/**
 * The expanded-item detail host: lazily imports the kind's renderer AND its
 * per-id query from `ACTIVITY_DETAIL_REGISTRY`, fetches the activity through
 * that query, and renders the component with the result bound to its input.
 *
 * This is what every expandable kind's `detail.load` resolves — one host,
 * whose registry lookups keep each renderer, its query document and its
 * fragment in a lazy chunk of its own, fetched the first time that kind
 * expands.
 *
 * The query cannot be injected up front, because which query to run is only
 * known once the kind's chunk has loaded. So the fetch starts inside the
 * load callback rather than in a field initializer, and `activity` is a
 * plain signal fed by that subscription instead of a `toSignal` of a
 * statically-injected service.
 */
@Component({
  selector: 'cvc-activity-stream-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, NzSkeletonModule],
  template: `
    @if (!entry) {
      <div class="detail-missing">
        No detail view is available for this activity.
      </div>
    } @else if (renderer() && activity()) {
      <ng-container *ngComponentOutlet="renderer()!; inputs: outletInputs()" />
    } @else {
      <nz-skeleton
        [nzActive]="true"
        [nzTitle]="false"
        [nzParagraph]="{ rows: 2 }" />
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 4px 12px 8px;
    }
    .detail-missing {
      color: rgba(0, 0, 0, 0.45);
    }
  `,
})
export class CvcActivityStreamDetail {
  private readonly context =
    injectContext<CvcStreamItemContext<ActivityStreamNode>>()
  private readonly streamState = inject(CvcStreamState)
  private readonly injector = inject(Injector)
  private readonly destroyRef = inject(DestroyRef)

  protected readonly entry =
    ACTIVITY_DETAIL_REGISTRY[this.context.item.__typename]

  /** the activity with this kind's detail fields, fetched by id */
  private readonly fetched = signal<unknown>(undefined)
  protected readonly activity = this.fetched.asReadonly()

  private readonly loadedRenderer = signal<Maybe<Type<unknown>>>(undefined)
  protected readonly renderer = this.loadedRenderer.asReadonly()

  protected readonly outletInputs = computed<Record<string, unknown>>(() => ({
    [this.entry.input]: this.activity(),
  }))

  constructor() {
    void this.entry?.load().then(({ component, query }) => {
      this.loadedRenderer.set(component)
      this.injector
        .get(query)
        .watch({ variables: { id: this.context.item.id } })
        .valueChanges.pipe(
          onlyCompleteData(),
          map(({ data }) => (data as { activity?: unknown }).activity),
          filter((activity) => activity != null),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((activity) => this.fetched.set(activity))
    })

    // the region's height changes when the renderer replaces the skeleton;
    // the scroller re-measures once that render lands
    effect(() => {
      if (!this.renderer() || !this.activity()) return
      afterNextRender(() => this.streamState.heightSettled(), {
        injector: this.injector,
      })
    })
  }
}
