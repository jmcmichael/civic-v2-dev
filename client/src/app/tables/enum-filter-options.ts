import {
  InputEnum,
  formatEvidenceEnum,
} from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { CvcEnumOption } from './entity-table.types'

/**
 * Every member of a generated enum, as filter options.
 *
 * Takes the enum object rather than a list of values so the options derive
 * from the schema: a member added server-side appears in the menu on the next
 * codegen run, one removed stops compiling, and the column config names which
 * enum it filters on. A generated TypeScript enum is a plain object, so
 * `Object.values` is all the enumeration needed.
 */
export function enumFilterOptions<TValue extends InputEnum>(
  members: Record<string, TValue>
): CvcEnumOption<TValue>[] {
  return Object.values(members).map((value) => ({
    label: formatEvidenceEnum(value),
    value,
  }))
}
