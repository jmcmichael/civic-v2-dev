import { FormlyFieldConfig } from '@ngx-formly/core'

export const sortByKey = (items: FormlyFieldConfig[]): FormlyFieldConfig[] =>
  [...items].sort((a, b) => String(a.key).localeCompare(String(b.key)))

export const sortByLabel = (items: FormlyFieldConfig[]): FormlyFieldConfig[] =>
  [...items].sort((a, b) =>
    String(a.props!.label).localeCompare(String(b.props!.label))
  )

// operator/value pairs: operator col span 8, value col span 16
const STATIC_SPANS = [8, 16]

export const withStatic = (items: FormlyFieldConfig[]): FormlyFieldConfig[] =>
  items.map((i) => ({
    ...i,
    type: 'formly-group',
    wrappers: ['row'],
    props: {
      ...i.props,
      row: { gutter: [8, 0] },
    },
    fieldGroup: i.fieldGroup?.map((child, index) => ({
      ...child,
      wrappers: child.wrappers ?? ['col', 'form-field'],
      props: {
        ...child.props,
        col: { span: STATIC_SPANS[index] ?? 24 },
      },
    })),
  }))

export const withRecursive = (
  items: FormlyFieldConfig[]
): FormlyFieldConfig[] =>
  items.map((i) => ({
    ...i,
    type: 'formly-group',
    props: {
      ...i.props,
    },
  }))

export const withHideExpression = (
  items: FormlyFieldConfig[]
): FormlyFieldConfig[] =>
  items.map((i) => ({
    ...i,
    expressions: {
      ...i.expressions,
      hide: (field: FormlyFieldConfig) => {
        return field.key !== field.parent?.props?.selectedKey
      },
    },
  }))

export const withSmallSize = (
  items: FormlyFieldConfig[]
): FormlyFieldConfig[] =>
  items.map((i) => ({
    ...i,
    props: {
      ...i.props,
      size: 'small',
    },
  }))
