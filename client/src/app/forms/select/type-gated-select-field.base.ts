import { Directive, effect } from '@angular/core'
import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { EntityType } from '@app/forms/states/base.state'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntitySelectResult } from './entity-select-config'
import {
  CvcEntitySelectFieldBase,
  CvcEntitySelectValue,
} from './entity-select-field.base'
import { CvcTypeGatedSelectFieldProps } from './select.types'

/** How a field's availability follows the form's entity type. */
export interface CvcTypeGateConfig {
  /**
   * Key into the form state's `requires` map — 'requiresDisease',
   * 'requiresTherapy', 'requiresAcmgCodes', 'requiresClingenCodes'. It is
   * derived from the chosen entity type, and false while none is chosen.
   */
  requiresKey: string
  /**
   * Description shown when the chosen entity type excludes this field, e.g.
   * `(t, e) => `${t} ${e} does not include associated diseases``.
   */
  excludedDescription: (entityType: string, entityName: string) => string
}

/**
 * An entity-select whose enabled/required state is driven by the form's
 * entity type (disease, therapy, acmg-code, clingen-code). A field supplies
 * only its `requires` state key and its "excluded" wording; subclasses that
 * need extra reactions to the gate override `onTypeGateApplied`.
 *
 * @template TResult the typeahead result fragment type
 * @template TParam the extra typeahead parameter's type; `void` when none
 * @template P the field's props, extending `CvcTypeGatedSelectFieldProps`
 */
@Directive()
export abstract class CvcTypeGatedSelectFieldBase<
  TResult extends CvcEntitySelectResult,
  TParam = void,
  P extends CvcTypeGatedSelectFieldProps = CvcTypeGatedSelectFieldProps,
> extends CvcEntitySelectFieldBase<TResult, TParam, P> {
  protected abstract readonly typeGate: CvcTypeGateConfig

  override ngOnInit(): void {
    super.ngOnInit()
    this.connectTypeGate()
  }

  /**
   * The gate reads signals, and effects flush at the end of a
   * change-detection cycle — by which point every sibling field's ngOnInit
   * has published its value into the state — so the first run already sees
   * the populated form and needs no readiness barrier.
   */
  private connectTypeGate(): void {
    const state = this.state
    if (!state) return

    // a form may provide a partial state — neither map is assumed
    const isRequired = state.requires?.[this.typeGate.requiresKey]
    if (!isRequired) {
      // a form with no `requires` map at all is simply not type-gated; one that
      // has the map but not this key is a misconfiguration worth reporting
      if (state.requires) {
        console.warn(
          `${this.field.id} field's form provides a state, but could not find ${this.typeGate.requiresKey} to attach.`
        )
      }
      return
    }

    const entityTypeKey = `${state.entityName.toLowerCase()}Type`
    const entityTypeField = this.props.requireType
      ? state.fields?.[entityTypeKey]
      : undefined
    if (this.props.requireType && !entityTypeField) {
      console.error(
        `${this.field.id} requireType is true, however form state does not provide ${entityTypeKey}.`
      )
      return
    }

    const entityType: () => Maybe<EntityType> =
      entityTypeField ?? (() => undefined)

    effect(
      () =>
        this.applyStateUpdates(
          isRequired() ?? false,
          entityType(),
          this.value()
        ),
      { injector: this.injector }
    )
  }

  private applyStateUpdates(
    isRequired: boolean,
    entityType: Maybe<EntityType>,
    value: CvcEntitySelectValue
  ): void {
    // this entity type has no association with what the field selects
    if (!isRequired && entityType) {
      this.props.required = false
      this.props.disabled = true
      this.props.description = this.typeGate.excludedDescription(
        formatEvidenceEnum(entityType),
        this.state!.entityName
      )
      this.props.extraType = 'prompt'
    }
    // type required but not yet chosen: prompt for it instead of a search box
    if (this.props.requireType && !entityType) {
      this.props.required = false
      this.props.disabled = true
      this.props.description = this.props.requireTypePromptFn(
        this.state!.entityName,
        this.props.isMultiSelect
      )
      this.props.extraType = 'prompt'
    }
    // state only reports the requires flag once an entity type is set
    if (isRequired) {
      this.props.required = true
      this.props.disabled = false
      this.props.description = undefined
      this.props.extraType = undefined
    }
    // a prepopulated value survives until a type is chosen; once the chosen
    // type excludes this field, drop it
    if (entityType && !isRequired && value !== undefined) {
      this.resetField()
    }

    this.onTypeGateApplied(isRequired, entityType)

    // props are plain objects read by the OnPush form-field wrapper above this
    // field; only marking the view dirty makes the wrapper re-render them
    this.markDirty()
  }

  /**
   * Hook for field-specific reactions to the gate, called after
   * `applyStateUpdates` has already written `props.description`,
   * `props.extraType`, `required` and `disabled` — an override runs last and
   * wins, so one that manages its own description should read/snapshot what
   * the gate wrote before overwriting it (see clingen-code-select for the
   * worked example). Runs before the view is marked dirty, so overrides need
   * no `markForCheck` of their own.
   *
   * @param _isRequired whether the chosen entity type requires this field
   * @param _entityType the chosen entity type, or undefined while none is
   */
  protected onTypeGateApplied(
    _isRequired: boolean,
    _entityType: Maybe<EntityType>
  ): void {}
}
