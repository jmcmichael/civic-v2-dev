import { Directive, Signal, computed, effect, signal } from '@angular/core'
import { EntityType } from '@app/forms/states/base.state'
import { Maybe } from '@app/generated/civic.apollo.types'
import { FieldTypeConfig } from '@ngx-formly/core'
import { CvcFieldBase } from './field.base'
import { CvcEnumSelectFieldProps } from './select.types'

export type CvcEnumSelectValue<E extends string> = Maybe<E | E[]>

/**
 * Base for fields that select from a fixed enum rather than searching the
 * API. Field templates declare `<nz-option nzCustomContent>` directly inside
 * their own `<nz-select>` — nz-select binds options via `@ContentChildren` at
 * template declaration, so they cannot be projected through a wrapper (see
 * projected-options.spec.ts).
 *
 * @template E the enum's string type
 * @template P the field's props interface, extending `CvcEnumSelectFieldProps`
 */
@Directive()
export abstract class CvcEnumSelectFieldBase<
  E extends string,
  P extends CvcEnumSelectFieldProps = CvcEnumSelectFieldProps,
> extends CvcFieldBase<CvcEnumSelectValue<E>, FieldTypeConfig<P>> {
  private readonly ownOptions = signal<E[]>([])

  /**
   * The enum values this field offers. Either the field's own list (set it
   * with `setOptions`) or, after `connectStateEnum`, the form state's enum
   * signal itself — referenced directly rather than copied through an effect.
   */
  protected optionValues: Signal<E[]> = this.ownOptions

  /** replaces the field's own option list (ignored after connectStateEnum) */
  protected setOptions(values: E[]): void {
    this.ownOptions.set(values)
  }

  /** the current selection when the field is single-select, else undefined */
  protected readonly selected: Signal<Maybe<E>> = computed(() => {
    const value = this.value()
    return Array.isArray(value) ? undefined : value
  })

  /**
   * Per-option copy shown beneath the field, for fields whose description is a
   * plain function of the selected value. Opt in with connectValueDescription;
   * a field whose description also depends on a gate should write props itself
   * in one effect instead, so there is only ever one writer.
   */
  protected descriptionFor(_value: E): Maybe<string> {
    return undefined
  }

  /** Installs the descriptionFor effect. Call from ngOnInit. */
  protected connectValueDescription(): void {
    effect(
      () => {
        const value = this.selected()
        const description = value ? this.descriptionFor(value) : undefined
        this.applyProps({
          description,
          extraType: description ? 'description' : undefined,
        } as Partial<P>)
      },
      { injector: this.injector }
    )
  }

  /**
   * Follows the form's `<entityName>Type` and returns it. A type change
   * invalidates whatever is selected, so this also clears the control;
   * describing the field is left to the caller, so that each field has exactly
   * one writer of `props`.
   *
   * **The first run never clears.** Arriving at an initial value is not a
   * change — on a revise or clone form that value is the prepopulated one, and
   * clearing it would wipe what the form had just loaded. There is a test
   * that fails if the guard is removed.
   */
  protected connectEntityTypeGate<T = EntityType>(): Signal<Maybe<T>> {
    const state = this.state
    if (!state) return signal<Maybe<T>>(undefined).asReadonly()

    const stateKey = `${state.entityName.toLowerCase()}Type`
    const entityType = state.fields[stateKey] as Maybe<Signal<Maybe<T>>>
    if (!entityType) {
      console.error(
        `${this.field.id} could not find form state's ${stateKey} to gate its options.`
      )
      return signal<Maybe<T>>(undefined).asReadonly()
    }

    return this.connectClearOnChange(entityType)
  }

  /**
   * Adopts a form-state enum as the dropdown's options. A reference, not a
   * copy: the state signal simply becomes `optionValues`, so there is no
   * effect to keep the two in step. Call from ngOnInit, before first render.
   */
  protected connectStateEnum(source: Signal<E[]>): void {
    this.optionValues = source
  }

  protected onTagClose(): void {
    this.resetField()
  }

  protected override resetField(): void {
    this.formControl.setValue(this.props.isMultiSelect ? [] : undefined)
  }
}
