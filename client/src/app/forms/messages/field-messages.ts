import { FormlyFieldConfig } from '@ngx-formly/core'

/**
 * The validator names a catalog entry may answer for: the global validators
 * registered in `validators/default.validator.ts` plus the Angular built-ins
 * formly forwards. A field's own `validators: { name: { message } }` outranks
 * the catalog, so one-off validators keep authoring their message inline.
 */
export type CvcValidationKey =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'integer'
  | 'nucleotide'
  | 'clinvar'

export type CvcFieldMessages = Partial<Record<CvcValidationKey, string>>

/**
 * What a field says when it fails validation, in one place, read as prose.
 *
 * Entries are keyed by message id, which a field resolves in this order:
 * explicit `props.messageId`, then the last segment of its model key, then
 * its registered type name. Keying on the model key is what lets a submit
 * form and its revise counterpart share copy without either knowing about
 * the other — both carry `key: 'comment'`.
 *
 * A field with no entry is not left mute: the generic fallbacks below name
 * it from its label. Author an entry when an instruction ("provide a comment
 * that…") beats a restatement ("comment is required").
 */
export const CVC_FIELD_MESSAGES = {
  comment: {
    required: 'Provide a comment explaining this submission.',
    minLength: 'Comments must be at least 10 characters.',
  },
  reviseComment: {
    required:
      'Provide a comment that supports or justifies your suggested revisions.',
    minLength: 'Comments must be at least 10 characters.',
  },
  evidenceStatement: {
    required:
      'Briefly describe what the source reports about this molecular profile.',
    minLength: 'Evidence statements must be at least 10 characters.',
  },
  assertionStatement: {
    required:
      'Describe the clinical significance this assertion claims, and the evidence behind it.',
    minLength: 'Assertion statements must be at least 10 characters.',
  },
  summary: { required: 'Provide a one-line summary of this assertion.' },
  rating: {
    required:
      'Rate how well the source supports this evidence, from one to five stars.',
  },
  significance: {
    required: 'Select the clinical significance this statement supports.',
  },
  evidenceType: {
    required: 'Select the type of clinical outcome this evidence describes.',
  },
  assertionType: {
    required: 'Select the type of clinical outcome this assertion describes.',
  },
  evidenceLevel: {
    required: 'Select the level of evidence this source provides.',
  },
  evidenceDirection: {
    required:
      'Select whether this evidence supports or does not support the statement.',
  },
  assertionDirection: {
    required:
      'Select whether this assertion supports or does not support the statement.',
  },
  variantOrigin: {
    required:
      'Select whether the variant is somatic, germline, or of another origin.',
  },
  sourceId: {
    required: 'Search for and select the source this evidence is drawn from.',
  },
  molecularProfileId: {
    required:
      'Search for and select the molecular profile this statement describes.',
  },
  featureId: {
    required: 'Search for and select the feature this variant belongs to.',
  },
  diseaseId: {
    required: 'Search for and select the disease this statement describes.',
  },
  therapyIds: { required: 'Add the therapies this statement describes.' },
  variantIds: { required: 'Add at least one variant to this group.' },
  evidenceItemIds: {
    required: 'Add at least one evidence item supporting this assertion.',
  },
} as const satisfies Record<string, CvcFieldMessages>

export type CvcFieldMessageId = keyof typeof CVC_FIELD_MESSAGES

const catalog: Record<string, CvcFieldMessages> = CVC_FIELD_MESSAGES

function messageId(field: FormlyFieldConfig): string | undefined {
  const explicit = field.props?.['messageId']
  if (typeof explicit === 'string') return explicit
  if (typeof field.key === 'string') return field.key.split('.').pop()
  if (typeof field.type === 'string') return field.type
  return undefined
}

/** The catalog entry a field resolves to, if it has one */
export function messagesFor(
  field: FormlyFieldConfig
): CvcFieldMessages | undefined {
  const id = messageId(field)
  const byId = id ? catalog[id] : undefined
  if (byId) return byId
  // a keyed field with no entry of its own can still answer by type
  return typeof field.type === 'string' ? catalog[field.type] : undefined
}

/** The catalog sentence for one validator, if the field has one */
export function fieldMessage(
  field: FormlyFieldConfig,
  key: CvcValidationKey
): string | undefined {
  return messagesFor(field)?.[key]
}

/**
 * Names the field from its label when the catalog has nothing to say — the
 * long tail improves without an entry, and only unlabeled fields fall all
 * the way through.
 */
export function genericRequired(field: FormlyFieldConfig): string {
  const label = field.props?.label
  return label ? `${label} is required.` : 'This field is required.'
}

/** Last resort for a validator that authored no message anywhere */
export function genericInvalid(errorKeys: string[]): string {
  return `Invalid value (${errorKeys.join(', ')}).`
}

/**
 * Authoring helper, and the reason a typo in a message id fails the build:
 * formly's props carry an index signature, so `props: { messageId: 'typoe' }`
 * type-checks on its own.
 *
 * `props: { ...withMessages('reviseComment'), label: 'Comment' }`
 */
export function withMessages(id: CvcFieldMessageId): {
  messageId: CvcFieldMessageId
} {
  return { messageId: id }
}
