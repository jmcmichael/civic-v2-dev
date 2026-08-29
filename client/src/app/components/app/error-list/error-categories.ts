import { FormSubmissionError } from '@app/core/utilities/submission-errors'

// Separate from error-list.component so eager consumers can name and
// serialize a category without dragging that component's ng-zorro modules
// and ngx-json-viewer onto first paint.

const CATEGORY_COLORS: Record<FormSubmissionError['category'], string> = {
  graphql: 'volcano',
  network: 'orange',
  apollo: 'purple',
  cache: 'geekblue',
  code: 'red',
}

const CATEGORY_NAMES: Record<FormSubmissionError['category'], string> = {
  graphql: 'GraphQL',
  network: 'Network',
  apollo: 'Apollo',
  cache: 'Cache',
  code: 'Code',
}

export function categoryColor(
  category: FormSubmissionError['category']
): string {
  return CATEGORY_COLORS[category]
}

export function categoryName(
  category: FormSubmissionError['category']
): string {
  return CATEGORY_NAMES[category]
}

/** one error as copyable text: header line, meta rows, raw log */
export function errorBlock(e: FormSubmissionError): string {
  const head = `[${e.category}${e.code ? ` ${e.code}` : ''}] ${e.message}`
  const meta = (e.meta ?? []).map((m) => `${m.label}: ${m.value}`)
  return [head, ...meta, e.log].filter(Boolean).join('\n')
}

/** every error as copyable text, separated */
export function submissionErrorsText(errors: FormSubmissionError[]): string {
  return errors.map((e) => errorBlock(e)).join('\n\n---\n\n')
}
