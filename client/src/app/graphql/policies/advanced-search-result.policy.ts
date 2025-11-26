import { getFormModelFromOriginalQuery } from '@app/graphql/utilities/form-model-from-original-query'
import { FieldFunctionOptions, Reference } from '@apollo/client/cache'
import { BooleanOperator, Maybe } from '@app/generated/civic.apollo'
import {
  AdvancedSearchNormalizedFormQuery,
  AnyNormalizedSubFilter,
} from '@app/forms/config/query-builder/query-builder.types'

export const CvcAdvancedSearchResultPolicy = {
  fields: {
    formQuery: {
      read(
        _: Maybe<Reference>,
        options: FieldFunctionOptions
      ): Maybe<Reference> {
        const { readField } = options
        const originalQuery = readField<string>('originalQuery')
        if (!originalQuery) return undefined
        return getFormModelFromOriginalQuery(originalQuery)
      },
    },
    normalizedFormQuery: {
      read(
        _: Maybe<Reference>,
        options: FieldFunctionOptions
      ): AdvancedSearchNormalizedFormQuery | undefined {
        const { readField } = options
        const originalQuery = readField<string>('originalQuery')
        if (!originalQuery) return undefined

        return getNormalizedFormQueryFromOriginalQuery(originalQuery)
      },
    },
  },
}

export function getNormalizedFormQueryFromOriginalQuery(
  queryString: string | undefined
): AdvancedSearchNormalizedFormQuery | undefined {
  if (!queryString) return undefined

  const rawQuery = getFormModelFromOriginalQuery(queryString)
  if (!rawQuery || typeof rawQuery !== 'object') return undefined

  return normalizeAdvancedSearchFilter(rawQuery)
}

/**
 * rawQuery is the object passed as the `query` argument
 * in the permalink GraphQL document, e.g.
 *
 * {
 *   booleanOperator: 'OR',
 *   subFilters: [
 *     { name: { operator: 'CONTAINS', value: 'Ocular' } },
 *     { evidenceRating: { operator: 'GE', value: 4 } },
 *     ...
 *   ]
 * }
 */
export function normalizeAdvancedSearchFilter(
  rawQuery: any
): AdvancedSearchNormalizedFormQuery {
  const booleanOperator = (rawQuery.booleanOperator ??
    null) as BooleanOperator | null

  const rawSubFilters = Array.isArray(rawQuery.subFilters)
    ? rawQuery.subFilters
    : []

  const normalizedSubFilters: AnyNormalizedSubFilter[] = rawSubFilters.map(
    (filterObj: any, index: number): AnyNormalizedSubFilter => {
      function getNullSubFilter(index: number): AnyNormalizedSubFilter {
        return {
          id: `subfilter-${index}`,
          fieldKey: '',
          input: null,
        }
      }

      // filter should be an object, but we'll check anyway
      if (!filterObj || typeof filterObj !== 'object') {
        console.error(
          `Invalid subfilter object at index ${index}: ${filterObj}`
        )
        return getNullSubFilter(index)
      }

      // each filterObj is guaranteed by query-builder convention
      // to have exactly one key: { [fieldKey]: { operator, value, ... } }
      const entry = Object.entries(filterObj)[0] as [string, any] | undefined
      if (!entry) {
        console.error(`Invalid subfilter entry at index ${index}: ${filterObj}`)
        return getNullSubFilter(index)
      }

      const [fieldKey, payload] = entry

      return {
        id: `subfilter-${index}`,
        fieldKey,
        input: payload ?? null,
      }
    }
  )

  // cast subFilters, since AdvancedSearchNormalizedFormQuery expects
  // NormalizedSubFilter<AdvancedSearchFilter>[], but we’ve built them
  // using the `any`-based alias. Formly forms/fields use the
  // more specific type, so will still have type-safety.
  return {
    booleanOperator,
    subFilters: normalizedSubFilters as any,
  }
}
