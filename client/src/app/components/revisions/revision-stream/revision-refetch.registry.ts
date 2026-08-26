import { Injectable, inject } from '@angular/core'
import { InternalRefetchQueryDescriptor } from '@apollo/client'
import {
  ModeratedEntities,
  ModeratedInput,
} from '@app/generated/civic.apollo.types'
import { AssertionDetailGQL } from '@app/views/assertions/assertions-detail/assertions-detail.query.gql.generated'
import { AssertionSummaryGQL } from '@app/views/assertions/assertions-detail/assertions-summary/assertions-summary.query.gql.generated'
import { EvidenceDetailGQL } from '@app/views/evidence/evidence-detail/evidence-detail.query.gql.generated'
import { EvidenceSummaryGQL } from '@app/views/evidence/evidence-detail/evidence-summary/evidence-summary.query.gql.generated'
import { FeatureDetailGQL } from '@app/views/features/features-detail/features-detail.query.gql.generated'
import { FeaturesSummaryGQL } from '@app/views/features/features-detail/features-summary/features-summary.query.gql.generated'
import { MolecularProfileDetailGQL } from '@app/views/molecular-profiles/molecular-profiles-detail/molecular-profiles-detail.query.gql.generated'
import { MolecularProfileSummaryGQL } from '@app/views/molecular-profiles/molecular-profiles-detail/molecular-profiles-summary/molecular-profiles-summary.query.gql.generated'
import { VariantGroupDetailGQL } from '@app/views/variant-groups/variant-groups-detail/variant-groups-detail.query.gql.generated'
import { VariantGroupsSummaryGQL } from '@app/views/variant-groups/variant-groups-detail/variant-groups-summary/variant-groups-summary.query.gql.generated'
import { VariantDetailGQL } from '@app/views/variants/variants-detail/variants-detail.query.gql.generated'
import { VariantSummaryGQL } from '@app/views/variants/variants-detail/variants-summary/variants-summary.query.gql.generated'

/**
 * The post-moderation refetch fan-out: accepting or rejecting revisions
 * changes the moderated entity itself, so the hosting page's Detail and
 * Summary documents refetch alongside the revision list.
 *
 * `VariantCoordinates` and `ExonCoordinates` have no entry here — their
 * subject id is the coordinate record's, while the page documents key on
 * a variantId only the hosting page knows. Coordinate tabs pass their
 * fan-out (page documents plus the tab-badge count query) through the
 * facade's `cvcModerationRefetch` input instead; the D3 ruling closes
 * the legacy gap where those two types refetched nothing at all.
 */
@Injectable({ providedIn: 'root' })
export class RevisionRefetchRegistry {
  private readonly variantDetail = inject(VariantDetailGQL)
  private readonly variantSummary = inject(VariantSummaryGQL)
  private readonly variantGroupDetail = inject(VariantGroupDetailGQL)
  private readonly variantGroupSummary = inject(VariantGroupsSummaryGQL)
  private readonly assertionDetail = inject(AssertionDetailGQL)
  private readonly assertionSummary = inject(AssertionSummaryGQL)
  private readonly featureDetail = inject(FeatureDetailGQL)
  private readonly featureSummary = inject(FeaturesSummaryGQL)
  private readonly evidenceDetail = inject(EvidenceDetailGQL)
  private readonly evidenceSummary = inject(EvidenceSummaryGQL)
  private readonly molecularProfileDetail = inject(MolecularProfileDetailGQL)
  private readonly molecularProfileSummary = inject(MolecularProfileSummaryGQL)

  queriesFor(moderated: ModeratedInput): InternalRefetchQueryDescriptor[] {
    const id = moderated.id
    switch (moderated.entityType) {
      case ModeratedEntities.Variant:
        return [
          { query: this.variantDetail.document, variables: { variantId: id } },
          { query: this.variantSummary.document, variables: { variantId: id } },
        ]
      case ModeratedEntities.Assertion:
        return [
          {
            query: this.assertionDetail.document,
            variables: { assertionId: id },
          },
          {
            query: this.assertionSummary.document,
            variables: { assertionId: id },
          },
        ]
      case ModeratedEntities.EvidenceItem:
        return [
          {
            query: this.evidenceDetail.document,
            variables: { evidenceId: id },
          },
          {
            query: this.evidenceSummary.document,
            variables: { evidenceId: id },
          },
        ]
      case ModeratedEntities.Feature:
        return [
          { query: this.featureDetail.document, variables: { featureId: id } },
          { query: this.featureSummary.document, variables: { featureId: id } },
        ]
      case ModeratedEntities.VariantGroup:
        return [
          {
            query: this.variantGroupDetail.document,
            variables: { variantGroupId: id },
          },
          {
            query: this.variantGroupSummary.document,
            variables: { variantGroupId: id },
          },
        ]
      case ModeratedEntities.MolecularProfile:
        return [
          {
            query: this.molecularProfileDetail.document,
            variables: { molecularProfileId: id },
          },
          {
            query: this.molecularProfileSummary.document,
            variables: { molecularProfileId: id },
          },
        ]
      default:
        return []
    }
  }
}
