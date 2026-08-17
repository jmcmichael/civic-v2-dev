import {
  InputEnum,
  formatEvidenceEnum,
} from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { CvcEnumOption } from './entity-table.types'

/**
 * Every member of a generated enum, as filter options.
 *
 * Replaces the `getAttributeFilters($enum(X))` both managers carried privately
 * and identically, and drops the `ts-enum-util` dependency with it — a
 * generated TypeScript enum is a plain object, so `Object.values` is all the
 * enumeration that was ever needed.
 *
 * The point of taking the enum object rather than a list of values is that the
 * options are then derived from the schema: a member added server-side appears
 * in the menu on the next codegen run, and one removed stops compiling. The old
 * form could not drift either, but it also could not tell you which enum a
 * column filtered on — that lived only in the `$enum()` call.
 */
export function enumFilterOptions<TValue extends InputEnum>(
  members: Record<string, TValue>
): CvcEnumOption<TValue>[] {
  return Object.values(members).map((value) => ({
    label: formatEvidenceEnum(value),
    value,
  }))
}
