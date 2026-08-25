import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import {
  DateSortColumns,
  EventFeedMode,
  SortDirection,
  SubscribableEntities,
} from '@app/generated/civic.apollo.types'
import { civicIcons } from '@app/icons-provider.module'
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { EMPTY, of } from 'rxjs'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { ActivityFeedUpdatesGQL } from '../../activity-feed/feed-filters/feed-filters.query.gql.generated'
import { OrgFilterSearchGQL } from '../../activity-feed/feed-filters/org-filter-select/org-filter-select.query.gql.generated'
import { UserFilterSearchGQL } from '../../activity-feed/feed-filters/user-filter-select/user-filter-select.query.gql.generated'
import {
  ActivityStreamFilterOptions,
  ActivityStreamFilters,
  ActivityStreamScope,
} from '../activity-stream.types'
import { CvcActivityStreamFilters } from './activity-stream-filters.component'

function makeFilters(): ActivityStreamFilters {
  return {
    activityType: [],
    organizationId: [],
    includeSubgroups: false,
    subjectType: [],
    userId: [],
    linkedApprovalId: null,
    occurredAfter: null,
    occurredBefore: null,
    sortByColumn: DateSortColumns.Created,
    sortByDirection: SortDirection.Desc,
  }
}

const options: ActivityStreamFilterOptions = {
  uniqueParticipants: [],
  participatingOrganizations: [],
  activityTypes: [],
  subjectTypes: [],
  sortColumns: [DateSortColumns.Created, DateSortColumns.LastModified],
  sortDirections: [SortDirection.Desc, SortDirection.Asc],
}

@Component({
  template: `<cvc-activity-stream-filters
    [(cvcFilters)]="filters"
    [cvcOptions]="options"
    [cvcScope]="scope()"
    [cvcCheckInterval]="interval"
    (cvcRefresh)="onRefresh()" />`,
  imports: [CvcActivityStreamFilters],
})
class HostComponent {
  readonly filters = signal<ActivityStreamFilters>(makeFilters())
  readonly options = options
  readonly scope = signal<ActivityStreamScope>({
    mode: EventFeedMode.Unscoped,
  })
  interval = 0
  refreshes = 0

  onRefresh(): void {
    this.refreshes++
  }
}

describe('CvcActivityStreamFilters', () => {
  let fixture: ComponentFixture<HostComponent>
  let host: HostComponent
  let updatesFetch: Mock

  const searchStub = {
    watch: () => ({ valueChanges: EMPTY, refetch: () => Promise.resolve() }),
    fetch: () => EMPTY,
  }

  beforeEach(() => {
    updatesFetch = vi.fn(() =>
      of({ data: { activities: { totalCount: 3 } }, loading: false })
    )
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideNzDateFnsAdapter(),
        provideNzIcons(civicIcons),
        { provide: ActivityFeedUpdatesGQL, useValue: { fetch: updatesFetch } },
        { provide: UserFilterSearchGQL, useValue: searchStub },
        { provide: OrgFilterSearchGQL, useValue: searchStub },
      ],
    })
  })

  function mount(): void {
    fixture = TestBed.createComponent(HostComponent)
    host = fixture.componentInstance
    fixture.autoDetectChanges()
  }

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement
  }

  it('renders the full control set when unscoped', () => {
    mount()

    // activity type, subject type, sort column, sort direction, and one
    // select inside each of the user/org typeaheads
    expect(el().querySelectorAll('nz-select')).toHaveLength(6)
    expect(el().querySelectorAll('nz-date-picker')).toHaveLength(2)
    expect(el().querySelector('cvc-user-filter-select')).toBeTruthy()
    expect(el().querySelector('cvc-org-filter-select')).toBeTruthy()
    expect(el().querySelectorAll('label[nz-checkbox]')).toHaveLength(1)
    expect(el().textContent).toContain('Include child org activities')
    expect(el().textContent).toContain('Sort Column')
    expect(el().textContent).toContain('Sort Direction')
  })

  it('hides the control each scope mode fixes', () => {
    mount()

    host.scope.set({ mode: EventFeedMode.User, userId: 1 })
    fixture.detectChanges()
    expect(el().querySelector('cvc-user-filter-select')).toBeNull()
    expect(el().querySelector('cvc-org-filter-select')).toBeTruthy()

    host.scope.set({ mode: EventFeedMode.Organization, organizationId: 1 })
    fixture.detectChanges()
    expect(el().querySelector('cvc-org-filter-select')).toBeNull()
    expect(el().querySelector('cvc-user-filter-select')).toBeTruthy()

    host.scope.set({
      mode: EventFeedMode.Subject,
      subject: { id: 1, entityType: SubscribableEntities.EvidenceItem },
    })
    fixture.detectChanges()
    expect(el().textContent).not.toContain('Subject Type')
  })

  it('emits each edit as a new filters object, mutating nothing', () => {
    mount()
    const component = fixture.debugElement.query(
      By.directive(CvcActivityStreamFilters)
    ).componentInstance as CvcActivityStreamFilters
    const before = host.filters()

    component.patch({ includeSubgroups: true })
    fixture.detectChanges()

    expect(host.filters().includeSubgroups).toBe(true)
    expect(host.filters()).not.toBe(before)
    expect(before.includeSubgroups).toBe(false)
  })

  it('polls for updates, shows the notice, and refreshes on its action', async () => {
    fixture = TestBed.createComponent(HostComponent)
    host = fixture.componentInstance
    host.interval = 0.05 // 50ms, in seconds
    fixture.autoDetectChanges()

    await vi.waitFor(() =>
      expect(el().textContent).toContain('3 new activities available')
    )
    expect(updatesFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: expect.objectContaining({
          mode: EventFeedMode.Unscoped,
          occurredAfter: expect.any(String),
        }),
      })
    )

    const refresh = el().querySelector('nz-alert button') as HTMLButtonElement
    refresh.click()
    expect(host.refreshes).toBe(1)
  })

  it('never polls while the check interval is 0', async () => {
    mount()
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(updatesFetch).not.toHaveBeenCalled()
  })
})
