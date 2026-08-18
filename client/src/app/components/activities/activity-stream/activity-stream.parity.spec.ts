import {
  ActivitySubjectInput,
  ActivityTypeInput,
  DateSortColumns,
  EventFeedMode,
  SortDirection,
} from '@app/generated/civic.apollo.types'
import { describe, expect, it } from 'vitest'
import {
  feedDefaultFilters,
  feedDefaultSettings,
} from '../activity-feed/activity-feed.config'
import { queryParamsToQueryVariables } from '../activity-feed/activity-feed.functions'
import {
  ActivityFeedFilters,
  ActivityFeedScope,
  ActivityFeedSettings,
} from '../activity-feed/activity-feed.types'
import {
  streamDefaultFilters,
  streamDefaultSettings,
} from './activity-stream.config'
import {
  scopeToVariables,
  streamFilterVariables,
} from './activity-stream.functions'
import {
  ActivityStreamFilters,
  ActivityStreamScope,
} from './activity-stream.types'

/**
 * Wire-level parity between the legacy feed's variable builder and the
 * stream facade's, across every host shape the feed serves. The stream
 * sends the same request the feed did, apart from these deliberate
 * differences:
 *
 * - `requestDetails` is gone — detail fields moved to the per-id detail
 *   query, so the connection document no longer takes the flag;
 * - `subject` travels as the one-element list its variable is declared as
 *   (the legacy builder passed a bare object, which GraphQL list input
 *   coercion wrapped identically on the server);
 * - `showOrganization` — a presentation-only setting the legacy builder
 *   spread into the variables, where the server ignored it as undeclared —
 *   stays client-side.
 */

/** the legacy builder's output, minus the deliberate differences */
function legacyVariables(params: {
  settings: ActivityFeedSettings
  filters: ActivityFeedFilters
}): Record<string, unknown> {
  const { requestDetails, showOrganization, subject, ...vars } =
    queryParamsToQueryVariables(params) as Record<string, unknown> & {
      subject?: unknown
    }
  return {
    ...vars,
    ...(subject !== undefined ? { subject: [subject] } : {}),
  }
}

/** the stream facade's complete variable set: base + filters patch + scope */
function streamVariables(params: {
  pageSize: number
  filters: ActivityStreamFilters
  showFilters: boolean
  scope: ActivityStreamScope
}): Record<string, unknown> {
  return {
    first: params.pageSize,
    ...streamFilterVariables({
      filters: params.filters,
      settings: {
        first: params.pageSize,
        includeAutomatedEvents: streamDefaultSettings.includeAutomatedEvents,
        showOrganization: streamDefaultSettings.showOrganization,
      },
      showFilters: params.showFilters,
    }),
    ...scopeToVariables(params.scope),
  }
}

/** strips undefined-valued keys, which never reach the wire */
function onWire(vars: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(vars)) as Record<string, unknown>
}

describe('legacy feed → stream variable parity', () => {
  it('matches for the unscoped, filterless home-page shape', () => {
    const legacy = legacyVariables({
      settings: { ...feedDefaultSettings, showFilters: false },
      filters: feedDefaultFilters,
    })
    const stream = streamVariables({
      pageSize: 50,
      filters: streamDefaultFilters,
      showFilters: false,
      scope: { mode: EventFeedMode.Unscoped },
    })

    expect(onWire(stream)).toEqual(onWire(legacy))
  })

  it('matches for a subject-scoped entity events tab', () => {
    const scope = {
      mode: EventFeedMode.Subject,
      subject: { id: 12, entityType: 'VARIANT' },
    }
    const legacy = legacyVariables({
      settings: {
        ...feedDefaultSettings,
        scope: scope as ActivityFeedScope,
      },
      filters: feedDefaultFilters,
    })
    const stream = streamVariables({
      pageSize: 50,
      filters: streamDefaultFilters,
      showFilters: true,
      scope: scope as ActivityStreamScope,
    })

    expect(onWire(stream)).toEqual(onWire(legacy))
  })

  it('matches for user- and organization-scoped pages', () => {
    for (const scope of [
      { mode: EventFeedMode.User, userId: 8 },
      { mode: EventFeedMode.Organization, organizationId: 3 },
    ]) {
      const legacy = legacyVariables({
        settings: {
          ...feedDefaultSettings,
          scope: scope as ActivityFeedScope,
        },
        filters: feedDefaultFilters,
      })
      const stream = streamVariables({
        pageSize: 50,
        filters: streamDefaultFilters,
        showFilters: true,
        scope: scope as ActivityStreamScope,
      })

      expect(onWire(stream)).toEqual(onWire(legacy))
    }
  })

  it('matches for the embedded approval shape with its linked-approval filter', () => {
    const filters = { ...feedDefaultFilters, linkedApprovalId: 7 }
    const legacy = legacyVariables({
      settings: { ...feedDefaultSettings, showFilters: false },
      filters,
    })
    const stream = streamVariables({
      pageSize: 50,
      filters: { ...streamDefaultFilters, linkedApprovalId: 7 },
      showFilters: false,
      scope: { mode: EventFeedMode.Unscoped },
    })

    expect(onWire(stream)).toEqual(onWire(legacy))
  })

  it('matches with every filter engaged', () => {
    const occurredAfter = new Date('2026-01-01T00:00:00Z')
    const occurredBefore = new Date('2026-06-01T00:00:00Z')
    const engaged = {
      activityType: [ActivityTypeInput.SubmitEvidenceItem],
      organizationId: [1, 2],
      includeSubgroups: true,
      subjectType: [ActivitySubjectInput.Variant],
      userId: [4],
      linkedApprovalId: null,
      occurredAfter,
      occurredBefore,
      sortByColumn: DateSortColumns.LastModified,
      sortByDirection: SortDirection.Asc,
    }
    const legacy = legacyVariables({
      settings: feedDefaultSettings,
      filters: engaged as ActivityFeedFilters,
    })
    const stream = streamVariables({
      pageSize: 50,
      filters: engaged as ActivityStreamFilters,
      showFilters: true,
      scope: { mode: EventFeedMode.Unscoped },
    })

    expect(onWire(stream)).toEqual(onWire(legacy))
  })
})
