import { formatNumber } from '@angular/common'
import { Maybe } from '@app/generated/civic.apollo.types'

/**
 * Locale-grouped number for a text cell — what the legacy tables' `| number`
 * pipes rendered ("1,234"; fractional scores keep the pipe's default of up
 * to three decimals). A function rather than `DecimalPipe` because a config
 * is data with no injection context; the locale is hard-coded to the one
 * locale the app registers (`registerLocaleData(en)`, app.module.ts), which
 * is also what the pipe resolved via `LOCALE_ID`.
 */
export function formatCount(value: Maybe<number>): Maybe<string> {
  return value === null || value === undefined
    ? undefined
    : formatNumber(value, 'en-US')
}
