import { NgComponentOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Type,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivityFeedItemFragment } from '@app/components/activities/activity-stream/detail/activity-stream-detail.query.gql.generated'
import { ActivityFeedItemGQL } from '@app/components/activities/activity-stream/detail/activity-stream-detail.query.gql.generated'
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
 * The expanded-item detail host: fetches the activity's detail data by id,
 * lazily imports the kind's renderer from `ACTIVITY_DETAIL_REGISTRY`, and
 * renders it with the fetched activity bound to the renderer's own input.
 *
 * This is what every expandable kind's `detail.load` resolves — one host,
 * whose registry lookups keep each renderer (and its imports) in a lazy
 * chunk of its own, fetched the first time that kind expands.
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
  private readonly gql = inject(ActivityFeedItemGQL)
  private readonly streamState = inject(CvcStreamState)
  private readonly injector = inject(Injector)

  protected readonly entry =
    ACTIVITY_DETAIL_REGISTRY[this.context.item.__typename]

  /** the activity with its detail fields, fetched by id on instantiation */
  protected readonly activity: ReturnType<
    typeof toSignal<Maybe<ActivityFeedItemFragment>, undefined>
  > = toSignal(
    this.gql
      .watch({
        variables: { id: this.context.item.id, requestDetails: true },
      })
      .valueChanges.pipe(
        onlyCompleteData(),
        map(({ data }) => data.activity),
        filter((activity) => activity != null)
      ),
    { initialValue: undefined }
  )

  private readonly loadedRenderer = signal<Maybe<Type<unknown>>>(undefined)
  protected readonly renderer = this.loadedRenderer.asReadonly()

  protected readonly outletInputs = computed<Record<string, unknown>>(() => ({
    [this.entry.input]: this.activity(),
  }))

  constructor() {
    void this.entry?.load().then((component) => {
      this.loadedRenderer.set(component)
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
