import { Injectable, inject, signal } from '@angular/core'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { ViewerNotificationCountGQL } from '@app/core/services/viewer/viewer.service.gql.generated'
import { MutatorWithState } from '@app/core/utilities/mutation-state-wrapper'
import {
  Maybe,
  ReadStatus,
  SubscribableEntities,
  SubscribableInput,
} from '@app/generated/civic.apollo.types'
import {
  SubscribeGQL,
  UnsubscribeGQL,
  UnsubscribeMutation,
  UnsubscribeMutationVariables,
  UpdateAllNotificationStatusGQL,
  UpdateAllNotificationStatusMutation,
  UpdateAllNotificationStatusMutationVariables,
  UpdateNotificationStatusGQL,
  UpdateNotificationStatusMutation,
  UpdateNotificationStatusMutationVariables,
} from '@app/components/notifications/notifications.mutations.gql.generated'
import { Apollo } from 'apollo-angular'
import {
  NotificationStreamGQL,
  NotificationStreamQuery,
} from './notification-stream.query.gql.generated'
import {
  NotificationStreamFilters,
  NotificationStreamNode,
} from './notification-stream.types'

/**
 * What the facade wires into the state at construction: the stream's
 * live surfaces the actions need. One object rather than five
 * callbacks, so a missing wire is a compile error at the one site.
 */
export interface NotificationStreamFacadeWiring {
  /** the exact variables the stream's current result set was fetched with */
  vars(): Record<string, unknown>
  filters(): NotificationStreamFilters
  /** a loaded node by id, for unsubscribe's subscribable lookup */
  nodeById(id: number): Maybe<NotificationStreamNode>
  refetch(): void
  clearSelection(): void
}

/**
 * The notification stream's action state, provided per facade instance:
 * the selection mirror, the select-all-matching escalation (D2), and
 * the mark/unsubscribe mutations with their cache and badge upkeep.
 *
 * D1 lives in `removeFromUnreadView`: marking read in the unread-only
 * view removes the items with a cache write — no refetch — so the
 * core's leave animation plays and the list closes the gap.
 */
@Injectable()
export class NotificationStreamState {
  private readonly apollo = inject(Apollo)
  private readonly networkErrors = inject(NetworkErrorsService)
  private readonly statusGql = inject(UpdateNotificationStatusGQL)
  private readonly allStatusGql = inject(UpdateAllNotificationStatusGQL)
  private readonly unsubscribeGql = inject(UnsubscribeGQL)
  private readonly subscribeGql = inject(SubscribeGQL)
  private readonly badgeGql = inject(ViewerNotificationCountGQL)
  /** the stream document, for the D1 cache write */
  private readonly streamGql = inject(NotificationStreamGQL)

  /** mirror of the stream's selection model; the facade writes it */
  readonly selectedIds = signal<ReadonlyArray<number>>([])

  /** D2 escalation: the user's actions apply to the whole matching set */
  readonly allMatchingSelected = signal(false)

  readonly isMutating = signal(false)

  /** set by the facade in its constructor */
  facade!: NotificationStreamFacadeWiring

  private readonly statusMutator = new MutatorWithState<
    UpdateNotificationStatusGQL,
    UpdateNotificationStatusMutation,
    UpdateNotificationStatusMutationVariables
  >(this.networkErrors)
  private readonly allStatusMutator = new MutatorWithState<
    UpdateAllNotificationStatusGQL,
    UpdateAllNotificationStatusMutation,
    UpdateAllNotificationStatusMutationVariables
  >(this.networkErrors)
  private readonly unsubscribeMutator = new MutatorWithState<
    UnsubscribeGQL,
    UnsubscribeMutation,
    UnsubscribeMutationVariables
  >(this.networkErrors)

  markRead(ids: number[]): void {
    this.markStatus(ids, ReadStatus.Read)
  }

  markUnread(ids: number[]): void {
    this.markStatus(ids, ReadStatus.Unread)
  }

  /** the whole filtered set, server-side; then the stream re-syncs */
  markAllMatching(newStatus: ReadStatus): void {
    this.isMutating.set(true)
    const state = this.allStatusMutator.mutate(
      this.allStatusGql,
      {
        input: {
          filters: filtersToInput(this.facade.filters()),
          newStatus,
        },
      },
      { refetchQueries: [{ query: this.badgeGql.document }] }
    )
    state.submitSuccess$.subscribe((ok) => {
      if (!ok) return
      this.isMutating.set(false)
      this.allMatchingSelected.set(false)
      this.facade.clearSelection()
      this.facade.refetch()
    })
    state.submitError$.subscribe((errors) => {
      if (errors.length > 0) this.isMutating.set(false)
    })
  }

  unsubscribe(subscribableId: number, typename: string): void {
    this.runUnsubscribe([toSubscribableInput(subscribableId, typename)])
  }

  /** unsubscribes the *selected* notifications' subscriptions (never all-matching) */
  bulkUnsubscribe(): void {
    const subscribables: SubscribableInput[] = []
    for (const id of this.selectedIds()) {
      const subscribable = this.facade.nodeById(id)?.subscription?.subscribable
      if (subscribable) {
        subscribables.push(
          toSubscribableInput(subscribable.id, subscribable.__typename)
        )
      }
    }
    if (subscribables.length > 0) this.runUnsubscribe(subscribables)
  }

  private markStatus(ids: number[], newStatus: ReadStatus): void {
    this.isMutating.set(true)
    const state = this.statusMutator.mutate(
      this.statusGql,
      { input: { ids, newStatus } },
      { refetchQueries: [{ query: this.badgeGql.document }] }
    )
    state.submitSuccess$.subscribe((ok) => {
      if (!ok) return
      this.isMutating.set(false)
      if (newStatus === ReadStatus.Read && !this.facade.filters().includeRead) {
        this.removeFromUnreadView(ids)
      }
      this.dropFromSelection(ids)
    })
    state.submitError$.subscribe((errors) => {
      if (errors.length > 0) this.isMutating.set(false)
    })
  }

  private runUnsubscribe(subscribables: SubscribableInput[]): void {
    this.isMutating.set(true)
    const state = this.unsubscribeMutator.mutate(
      this.unsubscribeGql,
      { input: { subscribables } },
      { refetchQueries: [{ query: this.badgeGql.document }] }
    )
    state.submitSuccess$.subscribe((ok) => {
      if (!ok) return
      this.isMutating.set(false)
      // subscription linkage on loaded items is stale until re-read
      this.facade.refetch()
    })
    state.submitError$.subscribe((errors) => {
      if (errors.length > 0) this.isMutating.set(false)
    })
  }

  /**
   * D1: rewrite the stream's cached result set without the read items.
   * A cache write, not a refetch, so the core's leave animation plays.
   * An argument-less write replaces the relay list wholesale, so the
   * accumulated pages minus the removed edges is exactly what remains.
   */
  private removeFromUnreadView(ids: number[]): void {
    const removed = new Set(ids)
    this.apollo.client.cache.updateQuery<NotificationStreamQuery>(
      {
        query: this.streamGql.document,
        variables: this.facade.vars(),
      },
      (data) => {
        if (!data) return data
        const edges = data.notifications.edges.filter(
          (edge) => !edge.node || !removed.has(edge.node.id)
        )
        const delta = data.notifications.edges.length - edges.length
        if (delta === 0) return data
        return {
          ...data,
          notifications: {
            ...data.notifications,
            edges,
            totalCount: data.notifications.totalCount - delta,
            unreadCount: Math.max(0, data.notifications.unreadCount - delta),
          },
        }
      }
    )
  }

  private dropFromSelection(ids: number[]): void {
    const dropped = new Set(ids)
    this.selectedIds.update((selected) =>
      selected.filter((id) => !dropped.has(id))
    )
  }
}

function toSubscribableInput(
  id: number,
  typename: string
): SubscribableInput {
  const entityType = typename as keyof typeof SubscribableEntities
  return { id, entityType: SubscribableEntities[entityType] }
}

/** the facade's filter state, as the server's NotificationFilter input */
function filtersToInput(filters: NotificationStreamFilters) {
  return {
    notificationReason: filters.notificationReason ?? undefined,
    eventType: filters.eventType ?? undefined,
    originatingObject: filters.originatingObject ?? undefined,
    originatingUserId: filters.originatingUserId ?? undefined,
    organizationId: filters.organizationId ?? undefined,
    includeRead: filters.includeRead,
  }
}
