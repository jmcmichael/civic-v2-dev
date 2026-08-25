import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  input,
  model,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { QueryRef } from 'apollo-angular'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { Subject, from, map, switchMap } from 'rxjs'
import {
  UserFilterSearchGQL,
  UserFilterSearchQuery,
  UserFilterSearchQueryVariables,
} from '../../../activity-feed/feed-filters/user-filter-select/user-filter-select.query.gql.generated'
import { ActivityStreamParticipant } from '../../activity-stream.types'

/**
 * Multi-select over CIViC users for the filter panel's Participating User
 * control. Options arrive from a name typeahead query as the user types;
 * the model carries the selected user ids.
 */
@Component({
  selector: 'cvc-user-filter-select',
  imports: [FormsModule, NzIconModule, NzSelectModule, CvcPipesModule],
  templateUrl: './user-filter-select.component.html',
  styleUrl: './user-filter-select.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcUserFilterSelect {
  /** participants in the stream's current results, as its connection reports them */
  readonly cvcUniqueParticipants = input.required<ActivityStreamParticipant[]>()

  /** the selected user ids */
  readonly cvcUserId = model.required<number[]>()

  private readonly gql = inject(UserFilterSearchGQL)

  /** the typeahead's query, created on first search and refetched after */
  private queryRef?: QueryRef<
    UserFilterSearchQuery,
    UserFilterSearchQueryVariables
  >

  /** search strings from the select's typeahead input */
  protected readonly onSearch$ = new Subject<string>()

  /** the latest search string, for the empty-result message */
  protected readonly onSearch = toSignal(this.onSearch$, { initialValue: '' })

  /** users matching the latest search string */
  protected readonly filteredUsers: Signal<ActivityStreamParticipant[]> =
    toSignal(
      this.onSearch$.pipe(
        switchMap((name) => {
          if (this.queryRef) {
            return from(this.queryRef.refetch({ name }))
          }
          this.queryRef = this.gql.watch({ variables: { name } })
          return this.queryRef.valueChanges
        }),
        map((result) => {
          const users: ActivityStreamParticipant[] = []
          for (const edge of result.data?.browseUsers?.edges ?? []) {
            const node = edge.node
            if (
              node?.id === undefined ||
              node.displayName === undefined ||
              node.role === undefined
            )
              continue
            users.push({
              __typename: 'User',
              id: node.id,
              displayName: node.displayName,
              role: node.role,
            })
          }
          return users
        })
      ),
      { initialValue: [] }
    )
}
