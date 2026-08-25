/**
 * The narrow attribute columns' shared vocabulary and metrics.
 *
 * Every entity table renders the same handful of attribute columns — a glyph
 * per row, an abbreviated header, the full name in a tooltip — and each one
 * used to restate its label, tooltip, width and alignment inline. The strings
 * are the part that must not drift: an abbreviation is a term of art a curator
 * learns once and then reads across the browse table, the selection manager
 * and anywhere else the attribute appears, so the same attribute reading
 * `ELVL` in one table and `EL` in another is a defect the compiler cannot see.
 *
 * Namespaced by entity because the vocabulary genuinely differs by family:
 * evidence abbreviates to three letters, assertions to four (their columns are
 * wider and the `A` prefix distinguishes assertion-scoped attributes from the
 * evidence ones curators meet on adjacent pages). `significance` exists under
 * both and means different things — the namespace is what lets `SIG` and
 * `ASIG` coexist rather than collide on a shared key.
 *
 * What is deliberately NOT here: `fixed`, the cell accessor, the sort column
 * and the filter. Pinning is a per-table layout decision (a pinned run has to
 * stay contiguous at its edge, and the manager's INT column sits mid-table),
 * and the other three are exactly what the config's inference type-checks
 * against the query — `filter.var` against `keyof TVars`, the accessor against
 * the row type. Moving them behind a helper erases both checks silently, which
 * a spike confirmed before this file was written: a column built by a generic
 * factory types its row as `unknown` and accepts a filter variable the query
 * does not declare.
 */
export const CVC_ATTRIBUTE_COLUMNS = {
  Evidence: {
    description: {
      key: 'description',
      label: 'DSC',
      tooltip: 'Evidence Description',
      width: '40px',
      align: 'center',
    },
    therapyInteractionType: {
      key: 'therapyInteractionType',
      label: 'INT',
      tooltip: 'Therapy Interaction Type',
      width: '40px',
      align: 'center',
    },
    evidenceLevel: {
      key: 'evidenceLevel',
      label: 'LVL',
      tooltip: 'Evidence Level',
      width: '40px',
      align: 'center',
    },
    evidenceType: {
      key: 'evidenceType',
      label: 'TYP',
      tooltip: 'Evidence Type',
      width: '40px',
      align: 'center',
    },
    evidenceDirection: {
      key: 'evidenceDirection',
      label: 'DIR',
      tooltip: 'Evidence Direction',
      width: '40px',
      align: 'center',
    },
    significance: {
      key: 'significance',
      label: 'SIG',
      tooltip: 'Significance',
      width: '40px',
      align: 'center',
    },
    /**
     * Four letters where its neighbours take three: variant origin is the one
     * attribute here describing the VARIANT rather than the evidence, and the
     * three-letter forms read poorly.
     */
    variantOrigin: {
      key: 'variantOrigin',
      label: 'VTOR',
      tooltip: 'Variant Origin',
      width: '40px',
      align: 'center',
    },
    /** 45px: five stars need the extra pixels the glyph columns do not */
    evidenceRating: {
      key: 'evidenceRating',
      label: 'RTG',
      tooltip: 'Evidence Rating',
      width: '45px',
      align: 'center',
    },
  },
  Assertion: {
    assertionType: {
      key: 'assertionType',
      label: 'ATYP',
      tooltip: 'Assertion Type',
      width: '60px',
      align: 'center',
    },
    assertionDirection: {
      key: 'assertionDirection',
      label: 'ADIR',
      tooltip: 'Assertion Direction',
      width: '60px',
      align: 'center',
    },
    significance: {
      key: 'significance',
      label: 'ASIG',
      tooltip: 'Significance',
      width: '60px',
      align: 'center',
    },
    ampLevel: {
      key: 'ampLevel',
      label: 'ACAT',
      tooltip: 'AMP/ASCO/CAP Category',
      width: '60px',
      align: 'center',
    },
  },
} as const
