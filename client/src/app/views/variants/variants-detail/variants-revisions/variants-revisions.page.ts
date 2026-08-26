import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternalRefetchQueryDescriptor } from '@apollo/client'
import {
  ModeratedEntities,
  ModeratedInput,
} from '@app/generated/civic.apollo.types'
import { VariantDetailGQL } from '@app/views/variants/variants-detail/variants-detail.query.gql.generated'
import { VariantSummaryGQL } from '@app/views/variants/variants-detail/variants-summary/variants-summary.query.gql.generated'
import {
  CoordinateIdsForVariantGQL,
  VariantCoordinateIdsFragment,
} from './coordinate-ids-for-variant.gql.generated'
import { onlyCompleteData } from 'apollo-angular'
import { Subscription } from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { filter, map } from 'rxjs/operators'

interface RevisionsTab {
  name: string
  moderated: ModeratedInput
  openCount: number
  /** the tab's extra post-moderation fan-out; see buildTabs */
  moderationRefetch: InternalRefetchQueryDescriptor[]
}

@Component({
  selector: 'cvc-variants-revisions',
  templateUrl: './variants-revisions.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class VariantsRevisionsPage implements OnDestroy, OnInit {
  routeSub?: Subscription
  coordsSub?: Subscription

  readonly tabs = signal<RevisionsTab[]>([])

  constructor(
    private gql: CoordinateIdsForVariantGQL,
    private variantDetailGql: VariantDetailGQL,
    private variantSummaryGql: VariantSummaryGQL,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(
        filter(isNonNulled),
        map((params) => +params.variantId),
        filter(isNonNulled)
      )
      .subscribe((variantId) => {
        this.coordsSub?.unsubscribe()
        // watched rather than fetched once with no-cache: the badge counts
        // sit in the cache, so the streams' post-moderation refetch of this
        // document updates them — the legacy one-shot went stale (D3)
        this.coordsSub = this.gql
          .watch({ variables: { variantId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map(({ data }) => data.variant),
            filter(isNonNulled)
          )
          .subscribe((variant) => {
            this.tabs.set(this.buildTabs(variantId, variant))
          })
      })
  }

  /**
   * The full tab list from one badge-query result, rebuilt idempotently on
   * every emission. Each tab carries its refetch extras: every tab refreshes
   * the badge counts, and the coordinate tabs add the variant page's Detail
   * and Summary documents — their subject id is the coordinate record's, so
   * the facade registry cannot know the variantId (D3).
   */
  private buildTabs(
    variantId: number,
    variant: VariantCoordinateIdsFragment
  ): RevisionsTab[] {
    const badgeRefetch: InternalRefetchQueryDescriptor = {
      query: this.gql.document,
      variables: { variantId },
    }
    const variantPageDocs: InternalRefetchQueryDescriptor[] = [
      { query: this.variantDetailGql.document, variables: { variantId } },
      { query: this.variantSummaryGql.document, variables: { variantId } },
    ]

    // the server's open count includes coordinate-field revisions; the
    // Variant Fields tab shows the remainder after the coordinate tabs
    // claim theirs
    let variantFieldCount = variant.openRevisionCount
    const coordinateTabs: RevisionsTab[] = []

    if (variant.__typename === 'GeneVariant' && variant.coordinates) {
      variantFieldCount -= variant.coordinates.openRevisionCount
      coordinateTabs.push({
        name: 'Variant Coordinates',
        openCount: variant.coordinates.openRevisionCount,
        moderated: {
          id: variant.coordinates.id,
          entityType: ModeratedEntities.VariantCoordinates,
        },
        moderationRefetch: [...variantPageDocs, badgeRefetch],
      })
    } else if (variant.__typename === 'FusionVariant') {
      if (variant.fivePrimeEndExonCoordinates) {
        variantFieldCount -=
          variant.fivePrimeEndExonCoordinates.openRevisionCount
        coordinateTabs.push({
          name: "5' Exon End Coordinates",
          openCount: variant.fivePrimeEndExonCoordinates.openRevisionCount,
          moderated: {
            id: variant.fivePrimeEndExonCoordinates.id,
            entityType: ModeratedEntities.ExonCoordinates,
          },
          moderationRefetch: [...variantPageDocs, badgeRefetch],
        })
      }
      if (variant.threePrimeStartExonCoordinates) {
        variantFieldCount -=
          variant.threePrimeStartExonCoordinates.openRevisionCount
        coordinateTabs.push({
          name: "3' Exon Start Coordinates",
          openCount: variant.threePrimeStartExonCoordinates.openRevisionCount,
          moderated: {
            id: variant.threePrimeStartExonCoordinates.id,
            entityType: ModeratedEntities.ExonCoordinates,
          },
          moderationRefetch: [...variantPageDocs, badgeRefetch],
        })
      }
    }

    return [
      {
        name: 'Variant Fields',
        openCount: variantFieldCount,
        moderated: { id: variantId, entityType: ModeratedEntities.Variant },
        moderationRefetch: [badgeRefetch],
      },
      ...coordinateTabs,
    ]
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe()
    this.coordsSub?.unsubscribe()
  }
}
