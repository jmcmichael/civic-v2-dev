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
  OrgFilterSearchGQL,
  OrgFilterSearchQuery,
  OrgFilterSearchQueryVariables,
} from '../../../activity-feed/feed-filters/org-filter-select/org-filter-select.query.gql.generated'
import { ActivityStreamOrganization } from '../../activity-stream.types'

/**
 * Multi-select over CIViC organizations for the filter panel's
 * Participating Organization control. Options arrive from a name typeahead
 * query as the user types; the model carries the selected organization ids.
 */
@Component({
  selector: 'cvc-org-filter-select',
  imports: [FormsModule, NzIconModule, NzSelectModule, CvcPipesModule],
  templateUrl: './org-filter-select.component.html',
  styleUrl: './org-filter-select.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcOrgFilterSelect {
  /** organizations in the stream's current results, as its connection reports them */
  readonly cvcParticipatingOrganizations =
    input.required<ActivityStreamOrganization[]>()

  /** the selected organization ids */
  readonly cvcOrganizationId = model.required<number[]>()

  private readonly gql = inject(OrgFilterSearchGQL)

  /** the typeahead's query, created on first search and refetched after */
  private queryRef?: QueryRef<
    OrgFilterSearchQuery,
    OrgFilterSearchQueryVariables
  >

  /** search strings from the select's typeahead input */
  protected readonly onSearch$ = new Subject<string>()

  /** the latest search string, for the empty-result message */
  protected readonly onSearch = toSignal(this.onSearch$, { initialValue: '' })

  /** organizations matching the latest search string */
  protected readonly filteredOrganizations: Signal<
    ActivityStreamOrganization[]
  > = toSignal(
    this.onSearch$.pipe(
      switchMap((name) => {
        if (this.queryRef) {
          return from(this.queryRef.refetch({ name }))
        }
        this.queryRef = this.gql.watch({ variables: { name } })
        return this.queryRef.valueChanges
      }),
      map((result) => {
        const organizations: ActivityStreamOrganization[] = []
        for (const edge of result.data?.browseOrganizations?.edges ?? []) {
          const node = edge.node
          if (node?.id === undefined || node.name === undefined) continue
          organizations.push({
            __typename: 'Organization',
            id: node.id,
            name: node.name,
          })
        }
        return organizations
      })
    ),
    { initialValue: [] }
  )
}
