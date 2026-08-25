import { OverlayContainer } from '@angular/cdk/overlay'
import { Type, WritableSignal, signal } from '@angular/core'
import { ComponentFixture } from '@angular/core/testing'
import { AbstractControl } from '@angular/forms'
import { By } from '@angular/platform-browser'
import { FormlyTestHostComponent } from './formly-test.host'

/**
 * The members every mounted-formly-field harness shares. The entity-select
 * and enum-select harnesses each held a verbatim copy of these; the only
 * genuine differences — which `nz-select` is under test, and how long a
 * settle waits by default — arrive as options.
 */
export interface FieldHarnessCore {
  fixture: ComponentFixture<FormlyTestHostComponent>
  /**
   * Flushes pending macrotasks and re-renders. `fixture.whenStable()` never
   * resolves in these TestBeds (a zone macrotask stays pending), so waits
   * are manual. The default is per-harness: 400 ms for entity selects (their
   * typeahead debounces 300 ms), 0 for enum selects (nothing debounces).
   */
  settle(ms?: number): Promise<void>
  openDropdown(): void
  /** the rendered dropdown options, which live in the cdk overlay container */
  optionItems(): HTMLElement[]
  /** the select's selected-item element */
  selectedItem(): HTMLElement
  control(): AbstractControl
  /** the field component instance */
  field<T>(fieldType: Type<T>): T
  destroy(): void
}

/**
 * Scaffold for the state-publication contract test both field contracts run:
 * the caller's base form state — merged, not replaced, since a field may need
 * other state to be usable — plus one probe signal registered under the
 * field's own key, which `CvcFieldBase.connectStateField` should write.
 */
export function statePublicationProbe<T>(
  key: string,
  base: Record<string, any> | undefined
): {
  formState: Record<string, any>
  stateField: WritableSignal<T | undefined>
} {
  const stateField = signal<T | undefined>(undefined)
  return {
    stateField,
    formState: {
      ...base,
      fields: { ...(base?.['fields'] ?? {}), [key]: stateField },
    },
  }
}

/**
 * Gives a mounted field's form state a slot for the field's own key when it
 * has a `fields` map but no slot there.
 *
 * `CvcFieldBase.connectStateField` publishes a field's value into
 * `formState.fields[<its own key>]` and warns when a form supplies a `fields`
 * map without that slot. In an app form that warning is a real signal — an
 * entity's state carries a slot per field, so a missing one is a
 * misconfiguration. A spec's state is different: it carries the keys the field
 * *reads* (variant-select needs `featureId` before its typeahead enables) and
 * has no reason to mention the field's own key. Left alone, that difference
 * fired the warning 22 times in one spec file and buried it.
 *
 * Adding the slot keeps mounted state shaped the way production state is, so
 * the warning stays worth reading. It also means every mount exercises the
 * publish path incidentally, which the state-publication contract test asserts
 * on deliberately via `statePublicationProbe`.
 *
 * A state with no `fields` map at all is returned untouched: that is the "no
 * state" case, which `connectStateField` returns from without complaint.
 */
export function withOwnStateSlot(
  key: string,
  formState: Record<string, any> | undefined
): Record<string, any> | undefined {
  const fields = formState?.['fields']
  if (!fields || fields[key] !== undefined) return formState
  return { ...formState, fields: { ...fields, [key]: signal(undefined) } }
}

export function fieldHarnessCore(
  fixture: ComponentFixture<FormlyTestHostComponent>,
  options: {
    /** the model/control key the field binds */
    key: string
    /** the nz-select under test (fields can render more than one) */
    select: () => HTMLElement
    /** default settle wait; see `FieldHarnessCore.settle` */
    settleMs: number
  }
): FieldHarnessCore {
  const overlay = fixture.debugElement.injector
    .get(OverlayContainer)
    .getContainerElement()

  return {
    fixture,
    async settle(ms = options.settleMs) {
      fixture.detectChanges()
      await new Promise((r) => setTimeout(r, ms))
      fixture.detectChanges()
      await new Promise((r) => setTimeout(r, 0))
      fixture.detectChanges()
    },
    openDropdown() {
      options.select().click()
      fixture.detectChanges()
    },
    optionItems: () =>
      Array.from(overlay.querySelectorAll('nz-option-item')) as HTMLElement[],
    selectedItem: () =>
      options
        .select()
        .querySelector('.ant-select-selection-item') as HTMLElement,
    control: () => fixture.componentInstance.form.get(options.key)!,
    field: <T>(fieldType: Type<T>) =>
      fixture.debugElement.query(By.directive(fieldType as Type<any>))
        .componentInstance as T,
    destroy() {
      fixture.debugElement.injector.get(OverlayContainer).ngOnDestroy()
    },
  }
}
