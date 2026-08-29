import { EnumToTitlePipe } from '@app/core/pipes/enum-to-title-pipe'
import { EvidenceStatus } from '@app/generated/civic.apollo.types'
import { describe, expect, it } from 'vitest'
import { formatEvidenceEnum } from './format-evidence-enum'
import { enumFormatters } from './format.common'

describe('enum label overrides', () => {
  const pipe = new EnumToTitlePipe()

  it('renders an overridden token the same way through every path', () => {
    expect(enumFormatters.title('NON_REJECTED')).toBe('Non-Rejected')
    expect(pipe.transform('NON_REJECTED')).toBe('Non-Rejected')
  })

  it('leaves tokens without an override to the mechanical formatting', () => {
    expect(enumFormatters.title('NON_REJECTED_LOOKALIKE')).toBe(
      'Non Rejected Lookalike'
    )
    expect(pipe.transform('PREDICTIVE')).toBe('Predictive')
  })

  it('keeps the per-domain quirks the overrides do not own', () => {
    // the pipe's glyphs, which are not what these tokens mean elsewhere
    expect(pipe.transform('POSITIVE')).toBe('+')
    expect(pipe.transform('NEGATIVE')).toBe('-')
    expect(pipe.transform('FIVE_PRIME_END_EXON_COORDINATE')).toBe(
      "5' End Exon Coordinate"
    )
    // evidence's own
    expect(formatEvidenceEnum('NA' as EvidenceStatus)).toBe('Not Applicable')
    expect(formatEvidenceEnum('SENSITIVITYRESPONSE' as EvidenceStatus)).toBe(
      'Sensitivity / Response'
    )
    expect(formatEvidenceEnum(EvidenceStatus.Accepted)).toBe('Accepted')
  })

  it('applies overrides only where a display label is wanted', () => {
    expect(enumFormatters.upper('NON_REJECTED')).toBe('NON REJECTED')
    expect(enumFormatters.lower('NON_REJECTED')).toBe('non rejected')
  })
})
