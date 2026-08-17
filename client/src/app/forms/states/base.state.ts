import {
  AssertionSignificance,
  AssertionDirection,
  AssertionType,
  TherapyInteraction,
  EvidenceSignificance,
  EvidenceDirection,
  EvidenceType,
} from '@app/generated/civic.apollo.types'
import { Signal, WritableSignal, computed, signal } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { $enum } from 'ts-enum-util'

export type EntityType = EvidenceType | AssertionType

export type EntitySignificance = EvidenceSignificance | AssertionSignificance

export type EntityDirection = EvidenceDirection | AssertionDirection

export type CvcFormMode = 'revise' | 'add' | 'clone'

export type ValidEntity = {
  entityType: EntityType
  significance: EntitySignificance[]
  entityDirection: EntityDirection[]
  requiresDisease: boolean
  requiresTherapy: boolean
  requiresAcmgCodes: boolean
  requiresAmpLevel: boolean
  requiresClingenCodes: boolean
  allowsFdaApproval: boolean
}

export enum EntityName {
  EVIDENCE = 'Evidence',
  ASSERTION = 'Assertion',
}

export enum SelectType {
  CS = 'significance',
  ED = 'entityDirection',
}

/**
 * The erased, by-key view of a state's field signals, for code that can only
 * know a key at runtime (`connectStateField`, `fieldOf`). Values are
 * `unknown` and a lookup may miss — both facts stated by the type instead of
 * hidden behind `any`. Code that knows its form statically reads a concrete
 * state's typed `fields` (`EvidenceFields`, `AssertionFields`) instead.
 */
export type EntityFieldSignalMap = {
  [key: string]: WritableSignal<unknown> | undefined
}

/**
 * What a form's state offers the fields mounted inside it — the type behind
 * `CvcFieldBase.state`. A discriminated pair: entity states (`BaseState`)
 * carry the whole derived surface, the lightweight finder/submit states
 * carry only field slots. One presence check (`state.requires`,
 * `state.enums` or `state.typeField`) therefore narrows to the full entity
 * surface — `entityName` and the rest come guaranteed with it.
 */
export type EntityFormState =
  | {
      /** field slots only: the finder/submit helper states */
      fields: EntityFieldSignalMap
      entityName?: undefined
      typeField?: undefined
      enums?: undefined
      requires?: undefined
    }
  | {
      /** the full surface every entity state (`BaseState`) guarantees */
      fields: EntityFieldSignalMap
      entityName: EntityName
      typeField: WritableSignal<Maybe<EntityType>>
      enums: EntityEnums
      requires: EntityRequires
    }

/**
 * A typed read of a field slot a state may or may not provide — for fields
 * that need a *specific* sibling's signal (variant-select needs `featureId`)
 * but mount under states that can lack it. The type argument is the caller's
 * claim about the slot's value type, checked nowhere — claim only what the
 * owning states declare. A missing slot returns `undefined` for the caller
 * to report or tolerate.
 */
export function fieldOf<T>(
  state: Maybe<EntityFormState>,
  key: string
): WritableSignal<Maybe<T>> | undefined {
  return state?.fields[key] as WritableSignal<Maybe<T>> | undefined
}

// 'state' for non-entity forms that just stores layout for form-field.wrapper's template logic
export type NoStateFormOptions = { formState: { formLayout: NzFormLayoutType } }

/** The four enum-option signals, derived from the chosen entity type. */
export type EntityEnums = {
  entityType: Signal<EntityType[]>
  significance: Signal<EntitySignificance[]>
  direction: Signal<EntityDirection[]>
  interaction: Signal<TherapyInteraction[]>
}

/**
 * The requires/allows flags, derived from the chosen entity type. `false`
 * until a type is chosen — nothing is required of an empty form.
 */
export type EntityRequires = {
  requiresDisease: Signal<boolean>
  requiresTherapy: Signal<boolean>
  requiresClingenCodes: Signal<boolean>
  requiresAcmgCodes: Signal<boolean>
  requiresAmpLevel: Signal<boolean>
  allowsFdaApproval: Signal<boolean>
}

/**
 * Shared form state, as signals.
 *
 * `fields` are written by the fields themselves (`connectStateField`);
 * `enums` and `requires` are `computed` from them. There is deliberately no
 * readiness barrier: a signal has a current value rather than a stream of
 * events, so there is nothing to replay and misread, and effects flush at the
 * end of a change-detection cycle — by which point every field's ngOnInit has
 * published. A field created later still reads the truth whenever it reads.
 * (`base.state.spec.ts` pins these semantics.)
 */
abstract class BaseState {
  formLayout: NzFormLayoutType = 'vertical'
  formMode: CvcFormMode = 'add'
  abstract readonly fields: EntityFieldSignalMap
  abstract readonly enums: EntityEnums
  abstract readonly requires: EntityRequires
  /**
   * The form's chosen entity type — `fields.evidenceType` /
   * `fields.assertionType` under one shared name, so cross-field machinery
   * (the type gates) reaches it without constructing a stringly key.
   */
  abstract readonly typeField: WritableSignal<Maybe<EntityType>>
  validStates = new Map<EntityType, ValidEntity>()
  entityName: EntityName
  pluralNames: Map<EntityName, string>

  protected constructor(en: EntityName) {
    this.entityName = en
    this.pluralNames = new Map<EntityName, string>()

    this.pluralNames.set(EntityName.ASSERTION, 'Assertions')
    this.pluralNames.set(EntityName.EVIDENCE, 'Evidence')
  }

  getTypeOptions = (): EntityType[] => {
    if (this.entityName == EntityName.ASSERTION) {
      return $enum(AssertionType).map((value) => value)
    } else {
      return $enum(EvidenceType).map((value) => value)
    }
  }

  getSignificanceOptions = (et: EntityType): EntitySignificance[] => {
    const state = this.validStates.get(et)
    return state?.significance || []
  }

  getInteractionOptions = (): TherapyInteraction[] => {
    return $enum(TherapyInteraction).map((value) => value)
  }

  isValidSignificanceOption = (
    et: EntityType,
    cs: EntitySignificance
  ): boolean => {
    const state = this.validStates.get(et)
    if (!state) {
      return true
    }
    return state.significance.includes(cs)
  }

  getDirectionOptions = (et: EntityType): EntityDirection[] => {
    const state = this.validStates.get(et)
    return state?.entityDirection || []
  }

  isValidDirectionOption = (et: EntityType, ed: EntityDirection): boolean => {
    const state = this.validStates.get(et)
    if (!state) {
      return true
    }
    return state.entityDirection.includes(ed)
  }

  requiresTherapy = (et: EntityType): boolean => {
    const state = this.validStates.get(et)
    return state !== undefined ? state.requiresTherapy : true
  }

  requiresDisease = (et: EntityType): boolean => {
    const state = this.validStates.get(et)
    return state !== undefined ? state.requiresDisease : true
  }

  requiresAcmgCodes = (at: EntityType): boolean => {
    const state = this.validStates.get(at)
    return state !== undefined ? state.requiresAcmgCodes : true
  }

  requiresAmpLevel = (at: EntityType): boolean => {
    const state = this.validStates.get(at)
    return state !== undefined ? state.requiresAmpLevel : true
  }

  requiresClingenCodes = (et: EntityType): boolean => {
    const state = this.validStates.get(et)
    return state !== undefined ? state.requiresClingenCodes : true
  }

  allowsFdaApproval = (et: EntityType): boolean => {
    const state = this.validStates.get(et)
    return state !== undefined ? state.allowsFdaApproval : true
  }

  /**
   * A signal derived from the chosen entity type: `pick` of that type once
   * one is chosen, `fallback` until then. The one derivation idiom both
   * entity states build their `enums` and `requires` from.
   */
  protected forType<T>(
    entityType: Signal<Maybe<EntityType>>,
    pick: (et: EntityType) => T,
    fallback: T
  ): Signal<T> {
    return computed(() => {
      const et = entityType()
      return et ? pick(et) : fallback
    })
  }

  /** the six requires/allows flags, derived from the chosen entity type */
  protected buildRequires(
    entityType: Signal<Maybe<EntityType>>
  ): EntityRequires {
    return {
      requiresDisease: this.forType(
        entityType,
        (et) => this.requiresDisease(et),
        false
      ),
      requiresTherapy: this.forType(
        entityType,
        (et) => this.requiresTherapy(et),
        false
      ),
      requiresClingenCodes: this.forType(
        entityType,
        (et) => this.requiresClingenCodes(et),
        false
      ),
      requiresAcmgCodes: this.forType(
        entityType,
        (et) => this.requiresAcmgCodes(et),
        false
      ),
      requiresAmpLevel: this.forType(
        entityType,
        (et) => this.requiresAmpLevel(et),
        false
      ),
      allowsFdaApproval: this.forType(
        entityType,
        (et) => this.allowsFdaApproval(et),
        false
      ),
    }
  }

  /** the four enum-option signals, derived from the chosen entity type */
  protected buildEnums(entityType: Signal<Maybe<EntityType>>): EntityEnums {
    return {
      entityType: signal(this.getTypeOptions()),
      significance: this.forType(
        entityType,
        (et) => this.getSignificanceOptions(et),
        []
      ),
      direction: this.forType(
        entityType,
        (et) => this.getDirectionOptions(et),
        []
      ),
      interaction: signal(this.getInteractionOptions()),
    }
  }
}

export { BaseState }
