// get-query-field-config.ts
import { FormCardOptions } from '@forms/wrappers/form-card/form-card.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { getSearchQuery } from './get-search-query'
import { getSelectOptions } from './get-select-options'
import { getFieldOptions } from './get-field-options'
import { AdvancedSearchEndpoint } from '../../query-builder.types'

/**
 * Builds the root query builder form config for a given advanced search endpoint.
 *
 * Normalized model shape:
 *
 * {
 *   query: {
 *     booleanOperator: BooleanOperator
 *     subFilters: NormalizedSubFilter<FilterType>[]
 *   },
 *   createPermalink: boolean
 * }
 */
export function getQueryFieldConfig(
  endpoint: AdvancedSearchEndpoint,
  cardOptions?: FormCardOptions
): FormlyFieldConfig[] {
  const fieldOptions = getFieldOptions(endpoint)

  return [
    // root `query` object
    {
      key: 'query',
      wrappers: ['query-builder-card'],
      props: {
        queryBuilderCardOptions: cardOptions,
        formSearchQuery: getSearchQuery(endpoint),
      },
      fieldGroup: [
        {
          key: 'booleanOperator',
          type: 'base-radio',
          props: {
            required: true,
            type: 'button',
            size: 'default',
            options: getSelectOptions('BooleanOperator'),
          },
        },
        {
          key: 'subFilters',
          type: 'query-subfilters',
          fieldArray: {
            type: 'query-filter',
            resetOnHide: true,
            props: {
              // per-endpoint field descriptors (leaf + recursive)
              fieldOptions,
              // root depth; nested query-filter instances will increment this
              depth: 0,
              size: 'default',
            },
          },
        },
      ],
    },

    // NOTE: createPermalink lives alongside `query` in the normalized form model.
    // It has no dedicated field type because the query-builder-card wrapper
    // manages its UI via a reactive checkbox + effect().
    {
      key: 'createPermalink',
      wrappers: [],
    },
  ]
}
