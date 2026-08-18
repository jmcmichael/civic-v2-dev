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

/** One rendered section of an enum filter: a heading (or none) + its options. */
export interface CvcEnumOptionGroup<TValue = unknown> {
  title: string | null
  options: CvcEnumOption<TValue>[]
}

/**
 * Partitions filter options into their rendered sections: contiguous options
 * sharing a `group` become one titled section, ungrouped options one untitled
 * run, all in declaration order. Both enum filter controls render through
 * this — the funnel's menu as `nz-menu-group`s, the select as
 * `nz-option-group`s. A wholly ungrouped options list yields a single
 * untitled section, so callers need no special case.
 */
export function groupEnumOptions<TValue>(
  options: ReadonlyArray<CvcEnumOption<TValue>>
): CvcEnumOptionGroup<TValue>[] {
  const groups: CvcEnumOptionGroup<TValue>[] = []
  for (const option of options) {
    const title = option.group ?? null
    const current = groups.at(-1)
    if (current && current.title === title) {
      current.options.push(option)
    } else {
      groups.push({ title, options: [option] })
    }
  }
  return groups
}
