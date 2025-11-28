// search-evidence-items.config.ts
import { FormlyFieldConfig } from '@ngx-formly/core'
import { INPUT_FIELD_CONFIG } from '@app/forms/config/query-builder/field-config/input-config/search-input.config'
import {
  sortByKey,
  withRecursive,
  withStatic,
} from '@app/forms/config/query-builder/field-config/functions/field-config-helpers'
// (no longer need getSelectOptions / getFieldOptions here)

/**
 * Field descriptors for the searchEvidenceItems endpoint.
 *
 * Leaf fields:
 *  - key + props.label
 *  - fieldGroup describing the SearchInput (from INPUT_FIELD_CONFIG)
 *
 * Recursive fields:
 *  - key + props.label
 *  - props.isRecursive = true
 *  - props.filterEndpoint = child endpoint to use for nested filters
 */
export const searchEvidenceItemsFieldOptions: FormlyFieldConfig[] = sortByKey([
  ...withStatic([
    {
      key: 'name',
      props: { label: 'Name' },
      fieldGroup: INPUT_FIELD_CONFIG['StringSearchInput'],
    },
    {
      key: 'description',
      props: { label: 'Description' },
      fieldGroup: INPUT_FIELD_CONFIG['StringSearchInput'],
    },
    {
      key: 'evidenceDirection',
      props: { label: 'Item Status' },
      fieldGroup: INPUT_FIELD_CONFIG['EvidenceDirectionTypeSearchInput'],
    },
    {
      key: 'evidenceRating',
      props: { label: 'Evidence Rating' },
      fieldGroup: INPUT_FIELD_CONFIG['IntSearchInput'],
    },
    {
      key: 'id',
      props: { label: 'ID' },
      fieldGroup: INPUT_FIELD_CONFIG['IntSearchInput'],
    },
    {
      key: 'status',
      props: { label: 'Status' },
      fieldGroup: INPUT_FIELD_CONFIG['EvidenceStatusTypeSearchInput'],
    },
    {
      key: 'isFlagged',
      props: { label: 'Is Flagged' },
      fieldGroup: INPUT_FIELD_CONFIG['BooleanSearchInput'],
    },
    {
      key: 'openRevisionCount',
      props: { label: 'Open Revision Count' },
      fieldGroup: INPUT_FIELD_CONFIG['IntSearchInput'],
    },
  ]),

  // recursive field descriptor for nested DiseaseSearchFilter
  ...withRecursive([
    {
      key: 'disease',
      props: {
        label: 'Disease',
        isRecursive: true,
        filterEndpoint: 'searchDiseases',
      },
      // NOTE: no fieldGroup here; query-filter builds the nested
      // { booleanOperator, subFilters } body based on filterEndpoint.
    },
  ]),
])
