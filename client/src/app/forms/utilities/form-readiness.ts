import { Injector, Signal, computed } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { AbstractControl } from '@angular/forms'
import { CVC_SUBMISSION_MESSAGES } from '@app/forms/messages/submission-messages'
import { readCachedEntityName } from '@app/tags/cached-entity'
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { Apollo } from 'apollo-angular'
import { EMPTY, Observable, auditTime, map, merge } from 'rxjs'
import {
  FormFieldIssue,
  FormFieldValue,
  collectFieldIssues,
  collectFieldValues,
  createUnrevisedCheck,
  serializeFieldConfig,
} from './form-field-issues'

/** Whether a form may be submitted, and everything that explains the answer. */
export interface CvcFormReadiness {
  readonly formValid: Signal<boolean>
  readonly fieldIssues: Signal<FormFieldIssue[]>
  /** the labeled model values, for the ready alert's submission preview */
  readonly fieldValues: Signal<FormFieldValue[]>
  /** JSON-safe formly config projection, for the preview's Copy Form Config */
  readonly formConfig: () => unknown
}

export interface CvcFormReadinessDeps {
  readonly injector: Injector
  readonly apollo: Apollo
  /** the registered message catalog, for resolving each issue's sentence */
  readonly formlyConfig: FormlyConfig
}

/**
 * Derives a form's submit readiness from any field in it.
 *
 * The field it is handed does not matter: every collector this calls walks
 * `field.parent` to the root first, so a footer wrapper and a leaf button
 * inside that footer get the same answers. That is what lets the actions row
 * own this state while a submit button used outside one still derives its
 * own.
 *
 * Call it from an injection context, or pass an injector — the `toSignal`
 * calls need one, and formly attaches the form after construction, so this
 * cannot run in a field type's constructor.
 */
export function createFormReadiness(
  field: FormlyFieldConfig,
  form: AbstractControl,
  deps: CvcFormReadinessDeps
): CvcFormReadiness {
  const { injector, apollo, formlyConfig } = deps
  const unrevised = createUnrevisedCheck()

  const formChange$ = merge(
    form.statusChanges as Observable<unknown>,
    (field.options?.fieldChanges ?? EMPTY) as Observable<unknown>
  ).pipe(auditTime(0))

  // the whole form, not the field's own group: a revise form with nothing
  // changed is complete but not submittable
  const valid = () => form.valid && !unrevised(field)
  const formValid = toSignal(formChange$.pipe(map(valid)), {
    initialValue: valid(),
    injector,
  })

  // an unrevised revise form reports as an issue of its own, so the alert
  // and the button's tooltip say why rather than claiming the form is ready
  const issues = () => {
    const found = collectFieldIssues(field, formlyConfig)
    return unrevised(field)
      ? [
          ...found,
          {
            label: 'Revision',
            scope: 'form' as const,
            message: CVC_SUBMISSION_MESSAGES.noRevisions,
          },
        ]
      : found
  }
  const fieldIssues = toSignal(formChange$.pipe(map(issues)), {
    initialValue: issues(),
    injector,
  })

  // entity names resolve from the cache the form's own tags populated, and
  // the originals map remembers pre-edit values for revised fields
  const originals = new Map<AbstractControl, unknown>()
  const collect = () =>
    collectFieldValues(field, {
      resolve: (typename, id) => readCachedEntityName(apollo, typename, id),
      originals,
    })
  const fieldValues = toSignal(formChange$.pipe(map(collect)), {
    initialValue: collect(),
    injector,
  })

  return {
    formValid,
    fieldIssues,
    fieldValues,
    formConfig: () => serializeFieldConfig(field),
  }
}

/** The readiness object `cvc-form-error-alert` takes as an input. */
export function readinessSnapshot(r: CvcFormReadiness) {
  return computed(() => ({
    valid: r.formValid(),
    issues: r.fieldIssues(),
    summary: r.fieldValues(),
    formConfig: r.formConfig,
  }))
}
