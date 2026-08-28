import { MissingFieldError } from '@apollo/client/cache'
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LinkError,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
  toErrorLike,
} from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'

/**
 * One submit-time failure, categorized for the form error tag's popover:
 * server validation (`graphql`), transport (`network`), apollo client
 * internals (`apollo`), normalized-cache failures (`cache`), or any other
 * client-side exception (`code`). `code` the machine code when one exists
 * (GraphQL extension code, HTTP status, error class), `meta` label/value
 * rows for the detail view (path, url…), `json` a structured payload for
 * the JSON tree, and `log` the full raw error as copyable text.
 */
export interface FormSubmissionError {
  readonly category: 'graphql' | 'network' | 'apollo' | 'cache' | 'code'
  readonly code?: string
  readonly message: string
  readonly meta?: { label: string; value: string }[]
  readonly json?: unknown
  readonly log?: string
}

// a thrown cause can hold anything, including cycles
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

/**
 * The capture ladder: categorizes any thrown value into FormSubmissionError
 * entries. Exported for every reporter (FormMutationService, the apollo
 * error link, AppErrorHandler) and the synthetic-error dev harness, which
 * feeds real error instances through the same ladder as live failures.
 */
export function toSubmissionErrors(error: unknown): FormSubmissionError[] {
  // server-side validation and execution errors, one entry each
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => {
      const code = e.extensions?.['code']
      return {
        category: 'graphql' as const,
        code: typeof code === 'string' ? code : undefined,
        message: e.message,
        meta: e.path ? [{ label: 'path', value: e.path.join('.') }] : undefined,
        // formatted errors are plain message/path/locations/extensions
        json: e,
        log: JSON.stringify(e, null, 2),
      }
    })
  }
  // multipart-subscription transport errors carry the same formatted shape
  if (CombinedProtocolErrors.is(error)) {
    return error.errors.map((e) => ({
      category: 'graphql' as const,
      message: e.message,
      meta: [{ label: 'source', value: 'subscription protocol' }],
      json: e,
      log: JSON.stringify(e, null, 2),
    }))
  }
  if (ServerError.is(error) || ServerParseError.is(error)) {
    const url = error.response?.url
    let json: unknown
    try {
      json = JSON.parse(error.bodyText)
    } catch {
      // non-JSON bodies (HTML error pages) stay in the log text
    }
    return [
      {
        category: 'network',
        code: String(error.statusCode),
        message: error.message,
        meta: [
          { label: 'status', value: String(error.statusCode) },
          ...(url ? [{ label: 'url', value: url }] : []),
        ],
        json,
        log: [`HTTP ${error.statusCode}`, url, error.bodyText, error.stack]
          .filter(Boolean)
          .join('\n\n'),
      },
    ]
  }
  if (error instanceof MissingFieldError) {
    return [
      {
        category: 'cache',
        code: 'MissingField',
        message: error.message,
        json: error.missing,
        log: error.stack ?? error.message,
      },
    ]
  }
  // in the mutate path an invariant violation is a cache write/normalization
  // failure (bad keyFields, malformed data passed to writeQuery/modify)
  if (error instanceof InvariantError) {
    return [
      {
        category: 'cache',
        code: 'InvariantError',
        message: error.message,
        log: error.stack ?? error.message,
      },
    ]
  }
  if (LocalStateError.is(error)) {
    return [
      {
        category: 'apollo',
        code: 'LocalState',
        message: error.message,
        meta: error.path
          ? [{ label: 'path', value: error.path.join('.') }]
          : undefined,
        log: error.stack ?? error.message,
      },
    ]
  }
  // a non-Error value thrown somewhere in the link chain
  if (UnconventionalError.is(error)) {
    return [
      {
        category: 'apollo',
        code: 'Unconventional',
        message: error.message,
        json: error.cause,
        log: safeStringify(error.cause),
      },
    ]
  }
  const errorLike = toErrorLike(error)
  // a fetch that never reached the server rejects with a TypeError
  const isTransport =
    errorLike.name === 'TypeError' &&
    /fetch|network|load/i.test(errorLike.message)
  return [
    {
      category: isTransport ? 'network' : 'code',
      code: errorLike.name,
      message: errorLike.message,
      meta: LinkError.is(error)
        ? [{ label: 'origin', value: 'apollo link chain' }]
        : undefined,
      log: errorLike.stack ?? `${errorLike.name}: ${errorLike.message}`,
    },
  ]
}
