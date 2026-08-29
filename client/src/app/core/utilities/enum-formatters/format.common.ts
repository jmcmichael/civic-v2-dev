export type FormatEnumOption = 'sentence' | 'title' | 'upper' | 'lower'

/**
 * Display labels that replace the mechanical de-snake-and-title-case, for
 * tokens whose correct rendering is the same everywhere they appear.
 *
 * Per-domain quirks do not belong here: variant origin renders POSITIVE as
 * '+' and evidence renders SENSITIVITYRESPONSE with a slash, but neither is
 * true of those tokens in general, so both stay in their own formatter.
 */
const LABEL_OVERRIDES: Record<string, string> = {
  NON_REJECTED: 'Non-Rejected',
}

/** The label an enum token displays as, or undefined to format it normally */
export function enumLabelOverride(value: string): string | undefined {
  return LABEL_OVERRIDES[value]
}

const prepare = function (str: string) {
  return str.replace(/_/g, ' ') // de-snake case
}

// Helper function to compose prepare with a formatter
const withPrepare = (formatter: (s: string) => string) => {
  return (s: string) => formatter(prepare(s))
}

export const enumFormatters = {
  sentence: withPrepare((s: string) => s.charAt(0).toUpperCase() + s.slice(1)),
  title: (s: string) =>
    enumLabelOverride(s) ??
    withPrepare((t: string) =>
      t
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )(s),
  upper: withPrepare((s: string) => s.toUpperCase()),
  lower: withPrepare((s: string) => s.toLowerCase()),
  prepare: prepare,
}
