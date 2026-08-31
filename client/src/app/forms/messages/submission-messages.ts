function sentenceCase(noun: string): string {
  return noun.charAt(0).toUpperCase() + noun.slice(1)
}

/**
 * Everything the submit-state surfaces say about a form as a whole: the
 * footer alert, the title tag, and the popover headings.
 *
 * Per-field sentences live in `field-messages.ts`; this is the copy that
 * describes the submission, not any one field. Kept out of the components so
 * the tag and the alert cannot describe the same form two different ways.
 */
export const CVC_SUBMISSION_MESSAGES = {
  submissionFailed: (noun: string) =>
    `${sentenceCase(noun)} submission failed, review error details.`,
  readyToSubmit: (noun: string) =>
    `All required fields provided, ${noun} may be submitted.`,
  multipleErrorsTag: '[Multiple Errors]',
  categoryErrorTag: (categoryName: string) => `[${categoryName} Error]`,
  notReady: 'Form is not ready to submit.',
  multipleIssues: 'Multiple issues prevent this form from being submitted.',
  errorsTitle: 'Submission Errors',
  /** the issues popover's heading, naming what it lists */
  issuesRequiringAttention: (fields: number, form: number) => {
    if (fields === 0) return 'Form Requiring Attention'
    if (fields === 1 && form === 0) return 'Field Requiring Attention'
    return 'Fields Requiring Attention'
  },
  fieldIssuesTitle: 'Fields',
  formIssuesTitle: 'Form',
  noRevisions: 'Change at least one field to suggest a revision.',
  previewTitle: 'Submission Preview',
} as const
