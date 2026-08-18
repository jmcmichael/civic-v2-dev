import { animate, style, transition, trigger } from '@angular/animations'
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { EventFeedMode } from '@app/generated/civic.apollo.types'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { of, timer } from 'rxjs'
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators'
import {
  ActivityFeedUpdatesGQL,
  ActivityFeedUpdatesQueryVariables,
} from '../../activity-feed/feed-filters/feed-filters.query.gql.generated'
import { disableDates, scopeToVariables } from '../activity-stream.functions'
import {
  ActivityStreamFilterOptions,
  ActivityStreamFilters,
  ActivityStreamScope,
} from '../activity-stream.types'
import { CvcDatePickerStylesComponent } from './date-picker-styles.component'
import { CvcOrgFilterSelect } from './org-filter-select/org-filter-select.component'
import { CvcUserFilterSelect } from './user-filter-select/user-filter-select.component'

/**
 * The stream's filter panel: activity/subject type selects, participating
 * user and organization typeaheads, occurred-date range pickers, and sort
 * column/direction selects. Controls the scope fixes are hidden — a
 * subject-scoped stream offers no subject-type control, a user-scoped
 * stream no user control, an organization-scoped stream no organization
 * control.
 *
 * Every control change merges into `cvcFilters` as a new object, so hosts
 * observe each edit as a model change.
 *
 * When `cvcCheckInterval` is set, the panel periodically checks whether
 * activities newer than its current results exist, and offers a notice
 * with a Refresh action; the action emits `cvcRefresh` and clears the
 * notice.
 */
@Component({
  selector: 'cvc-activity-stream-filters',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCheckboxModule,
    CvcPipesModule,
    CvcUserFilterSelect,
    CvcOrgFilterSelect,
    CvcDatePickerStylesComponent,
  ],
  templateUrl: './activity-stream-filters.component.html',
  styleUrl: './activity-stream-filters.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('refreshAlertAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('250ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('250ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class CvcActivityStreamFilters {
  /** the panel's control values; every edit emits a new filters object */
  readonly cvcFilters = model.required<ActivityStreamFilters>()

  /** the option lists the panel's controls offer */
  readonly cvcOptions = input.required<ActivityStreamFilterOptions>()

  /** what the host scoped the stream to; hides the controls the scope fixes */
  readonly cvcScope = input.required<ActivityStreamScope>()

  /** update-check period, in seconds; 0 disables the check */
  readonly cvcCheckInterval = input<number>(0)

  /** emitted when the user accepts the new-activity notice's Refresh action */
  readonly cvcRefresh = output<void>()

  /** disabled-date predicates for the two occurred-date pickers */
  protected readonly disableDates = disableDates

  /** subject-scoped streams fix the subject, so offer no subject-type control */
  protected readonly showSubjectType = computed(
    () => this.cvcScope().mode !== EventFeedMode.Subject
  )

  /** user-scoped streams fix the user, so offer no user control */
  protected readonly showUserSelect = computed(
    () => this.cvcScope().mode !== EventFeedMode.User
  )

  /** organization-scoped streams fix the org, so offer no org control */
  protected readonly showOrgSelect = computed(
    () => this.cvcScope().mode !== EventFeedMode.Organization
  )

  private readonly gql = inject(ActivityFeedUpdatesGQL)

  /** bumped by the Refresh action to restart the update check */
  private readonly pollReset = signal(0)

  /**
   * Everything whose change means the panel's host is about to show fresh
   * results: filter and scope edits re-run the stream's query, and the
   * Refresh action re-runs it explicitly. Any change restarts the update
   * check from a new baseline.
   */
  private readonly pollBaseline = computed(() => ({
    filters: this.cvcFilters(),
    scope: this.cvcScope(),
    interval: this.cvcCheckInterval(),
    reset: this.pollReset(),
  }))

  /**
   * How many activities occurred after the panel's baseline, under the
   * current filters and scope.
   *
   * - 0 while the check is disabled (`cvcCheckInterval` of 0)
   * - polls every `cvcCheckInterval` seconds, bypassing the cache
   * - emits 0 on each new baseline, then the count of newer activities
   * - only re-emits when the count changes
   */
  protected readonly newActivities: Signal<number> = toSignal(
    toObservable(this.pollBaseline).pipe(
      switchMap(({ interval }) => {
        if (interval <= 0) return of(0)
        const since = new Date()
        const period = interval * 1000
        return timer(period, period).pipe(
          switchMap(() =>
            this.gql
              .fetch({
                variables: this.updateCheckVariables(since),
                fetchPolicy: 'no-cache',
              })
              .pipe(map((result) => result.data?.activities?.totalCount ?? 0))
          ),
          startWith(0),
          distinctUntilChanged()
        )
      })
    ),
    { initialValue: 0 }
  )

  /** merges a control change into the filters model, as a new object */
  patch(change: Partial<ActivityStreamFilters>): void {
    this.cvcFilters.update((filters) => ({ ...filters, ...change }))
  }

  /** the notice's Refresh action: notify the host, restart the check */
  onRefresh(): void {
    this.cvcRefresh.emit()
    this.pollReset.update((n) => n + 1)
  }

  /**
   * The update check's query variables: the current filters and scope,
   * with the baseline as `occurredAfter` so the count covers only
   * activities newer than what the panel's host has shown. Scope
   * variables win any collision with filters, as they do in the stream
   * query itself.
   */
  private updateCheckVariables(since: Date): ActivityFeedUpdatesQueryVariables {
    const filters = this.cvcFilters()
    return {
      activityType:
        filters.activityType.length > 0 ? filters.activityType : undefined,
      subjectType:
        filters.subjectType.length > 0 ? filters.subjectType : undefined,
      organizationId:
        filters.organizationId.length > 0 ? filters.organizationId : undefined,
      userId: filters.userId.length > 0 ? filters.userId : undefined,
      includeSubgroups: filters.includeSubgroups,
      ...scopeToVariables(this.cvcScope()),
      occurredAfter: since.toISOString(),
    }
  }
}
