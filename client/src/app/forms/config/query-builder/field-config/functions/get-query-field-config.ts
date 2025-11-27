import { FormCardOptions } from '@forms/wrappers/form-card/form-card.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { getSearchQuery } from './get-search-query'
import { getSelectOptions } from './get-select-options'
import { getFieldOptions } from './get-field-options'
import { QueryBuilderSearchEndpoint } from '../../query-builder.types'

export function getQueryFieldConfig(
  key: 'query' | string = 'query',
  endpoint: QueryBuilderSearchEndpoint,
  cardOptions?: FormCardOptions
): FormlyFieldConfig[] {
  if (key === 'query') {
    return [
      {
        key: `${key}`,
        wrappers: [`query-builder-card`],
        props: {
          queryBuilderCardOptions: cardOptions,
          formSearchQuery: getSearchQuery(endpoint),
        },
        fieldGroup: [
          {
            key: 'booleanOperator',
            type: 'base-radio',
            wrappers: [],
            props: {
              required: true,
              type: 'button',
              options: getSelectOptions('BooleanOperator'),
            },
          },
          {
            key: 'subFilters',
            type: 'query-subfilters',
            wrappers: [],
            fieldArray: {
              type: 'query-filter',
              resetOnHide: true,
              props: {
                selectedKey: undefined,
                size: 'default',
                options: getFieldOptions(endpoint).map((opt) => ({
                  label: opt.props?.label,
                  value: opt.key,
                })),
              },
              fieldGroup: getFieldOptions(endpoint),
            },
          },
          // NOTE: createPermalink has no field type bc its value
          // is managed by a reactive checkbox control & effect()
          // in query-builder-card.wrapper
          {
            key: 'createPermalink',
            wrappers: [],
          },
        ],
      },
    ]
  } else {
    return [
      {
        key: `${key}`,
        wrappers: ['query-subfilters-card'],
        props: {
          formCardOptions: cardOptions,
          // formSearchQuery: getSearchQuery(endpoint),
        },
        fieldGroup: [
          {
            key: 'booleanOperator',
            type: 'base-radio',
            wrappers: [],
            props: {
              required: true,
              size: 'small',
              type: 'button',
              options: getSelectOptions('BooleanOperator'),
            },
          },
          {
            key: 'subFilters',
            type: 'query-subfilters',
            wrappers: [],
            props: {
              filterEndpoint: endpoint,
            },
            fieldArray: (field) => ({
              type: 'query-filter',
              resetOnHide: true,
              props: {
                selectedKey: undefined,
                options: getFieldOptions(endpoint).map((opt) => ({
                  label: opt.props?.label,
                  value: opt.key,
                })),
              },
              fieldGroup: getFieldOptions(field.props!.filterEndpoint),
            }),
          },
          {
            key: 'createPermalink',
            wrappers: [],
          },
        ],
      },
    ]
  }
}
