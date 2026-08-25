import { OverlayContainer } from '@angular/cdk/overlay'
import { Type } from '@angular/core'
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
