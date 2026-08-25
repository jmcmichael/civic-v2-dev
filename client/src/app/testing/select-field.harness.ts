import { Type, WritableSignal, signal } from '@angular/core'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { CvcSelectFieldsRegistryModule } from '@app/forms/select/select-fields.registry.module'
import { CvcOrgSubmitButtonTypeModule } from '@app/forms/types/org-submit-button/org-submit-button.type.module'
import { CvcFormWrappersModule } from '@app/forms/wrappers/form-wrappers.module'
import { civicIcons } from '@app/icons-provider.module'
import {
  CaretRightOutline,
  QuestionCircleFill,
} from '@ant-design/icons-angular/icons'
import { CvcTypeGatedSelectFieldProps } from '@app/forms/select'
import { BaseState, EntityType } from '@app/forms/states/base.state'
import { Maybe } from '@app/generated/civic.apollo.types'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { describe, expect, it, vi } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from './apollo-test.providers'
import {
  FieldHarnessCore,
  fieldHarnessCore,
  statePublicationProbe,
} from './field-harness-core'
import { createFieldTestHost } from './formly-test.host'

/** Everything a spec needs to drive one mounted entity-select field. */
export interface SelectFieldHarness extends FieldHarnessCore {
  /** every GraphQL operation the field has issued, in order */
  operations: MockGraphqlOperation[]
  type(text: string): void
  callsTo(operationName: string): MockGraphqlOperation[]
  /** what a quick-add form emits once it has created an entity */
  quickAdd(fieldType: Type<unknown>, value: number | number[]): void
}

export interface SelectFieldHarnessConfig {
  /** the registered formly type name, e.g. 'disease-select' */
  type: string
  /** the model/control key, e.g. 'diseaseId' */
  key: string
  /** answers each GraphQL operation; throw for anything unexpected */
  respond: (op: MockGraphqlOperation) => Record<string, any>
  /** overrides merged into the field's FormlyFieldConfig */
  field?: Partial<FormlyFieldConfig>
  /** initial form model, e.g. `{ diseaseId: 42 }` to prepopulate */
  model?: Record<string, any>
  /** the form state instance fields read via `options.formState` */
  formState?: any
}

/**
 * Mounts an entity-select field by its registered type name against a mock
 * Apollo link, and returns the handles specs need to drive it. Awaits one
 * settle before returning — cdk-virtual-scroll renders zero options if the
 * dropdown opens before it has measured.
 */
export async function createSelectFieldHarness(
  config: SelectFieldHarnessConfig
): Promise<SelectFieldHarness> {
  const operations: MockGraphqlOperation[] = []

  const fixture = createFieldTestHost({
    field: {
      key: config.key,
      type: config.type,
      wrappers: [],
      ...config.field,
    },
    model: config.model ?? {},
    formState: config.formState,
    // civicIcons covers the civic-* set; ant's own icons are registered
    // individually, since IconsProviderModule ships only four of them. An
    // unregistered icon throws *outside* the test's call stack, so it leaves
    // every assertion green while the runner still exits non-zero — which is
    // how question-circle-fill (the MP expression editor's help buttons) went
    // unnoticed. Add to this list rather than to a single spec.
    //
    // org-submit-button is registered because several quick-add forms embed
    // one, and a field renders its quick-add as soon as a search misses.
    // The wrappers come along because nested forms — the MP finder, the
    // Fusion and Region builders — lay themselves out with them.
    imports: [
      CvcSelectFieldsRegistryModule,
      CvcOrgSubmitButtonTypeModule,
      CvcFormWrappersModule,
      NzIconModule.forRoot([
        ...civicIcons,
        CaretRightOutline,
        QuestionCircleFill,
      ]),
    ],
    providers: [
      provideMockApollo(config.respond, operations),
      provideRouter([]),
      provideNoopAnimations(),
    ],
  })

  /**
   * The field's entity select, which is not always its only one — source,
   * feature and variant selects each render a parameter picker alongside it.
   * The cvcEntitySelect directive marks the one under test.
   */
  const entitySelect = (): HTMLElement =>
    fixture.nativeElement.querySelector('nz-select[cvcEntitySelect]') ??
    fixture.nativeElement.querySelector('nz-select')

  const harness: SelectFieldHarness = {
    // 400 ms default settle: the typeahead debounces 300 ms
    ...fieldHarnessCore(fixture, {
      key: config.key,
      select: entitySelect,
      settleMs: 400,
    }),
    operations,
    type(text: string) {
      const input = entitySelect().querySelector('input') as HTMLInputElement
      input.value = text
      input.dispatchEvent(new Event('input', { bubbles: true }))
      fixture.detectChanges()
    },
    callsTo: (operationName) =>
      operations.filter((o) => o.operationName === operationName),
    quickAdd(fieldType, value) {
      const instance = this.field(fieldType) as unknown as {
        onEntityCreated(v: number | number[]): void
      }
      instance.onEntityCreated(value)
    },
  }

  await harness.settle()
  return harness
}

export interface EntitySelectContractConfig<TField> {
  /** the field component class, used to reach the instance */
  fieldType: Type<TField>
  /** registered single-select type name */
  type: string
  /** registered multi-select type name */
  multiType: string
  key: string
  typeaheadOp: string
  tagOp: string
  respond: (op: MockGraphqlOperation) => Record<string, any>
  /** the first two records the typeahead returns, in order */
  records: [{ id: number; name: string }, { id: number; name: string }]
  /** how many options the typeahead renders; defaults to the two above */
  optionCount?: number
  /** the typeahead variables produced by an empty search */
  emptySearchVars: Record<string, any>
  /** the typeahead variables produced by searching `searchTerm` */
  searchVars: (term: string) => Record<string, any>
  /** the tag-query variables for an id */
  tagVars: (id: number) => Record<string, any>
  /** a search term that should match; defaults to the first record's prefix */
  searchTerm?: string
  /** set false for fields with no quick-add form */
  hasQuickAdd?: boolean
  /**
   * The field's minimum search length, when it sets one. Above zero the field
   * cannot answer an empty search, so opening the dropdown lists nothing and
   * the contract types `searchTerm` wherever it needs options on screen.
   */
  minSearchStrLength?: number
  /**
   * Form state a field needs before it will work at all — variant-select is
   * disabled until featureId has a value. A factory, so each test gets its
   * own signals, and merged with (not replaced by) the state the contract
   * supplies itself.
   */
  formState?: () => Record<string, any>
}

/**
 * The behavior every entity-select field inherits from
 * CvcEntitySelectFieldBase. Call inside a `describe` for the field; add
 * field-specific `it`s (metadata rendering, type gating) alongside it.
 */
export function describeEntitySelectContract<TField>(
  config: EntitySelectContractConfig<TField>
): void {
  const [first, second] = config.records
  const term = config.searchTerm ?? first.name.slice(0, 3).toLowerCase()
  const minSearchStrLength = config.minSearchStrLength ?? 0

  const setup = (overrides: Partial<SelectFieldHarnessConfig> = {}) =>
    createSelectFieldHarness({
      type: config.type,
      key: config.key,
      respond: config.respond,
      formState: config.formState?.(),
      ...overrides,
    })

  /** get options on screen, whatever it takes for this field */
  const showOptions = async (h: SelectFieldHarness) => {
    h.openDropdown()
    if (minSearchStrLength > 0) h.type(term)
    await h.settle()
  }

  describe('entity-select contract', () => {
    it('issues no query until the dropdown is opened or a search is typed', async () => {
      const h = await setup()
      await h.settle()
      expect(h.callsTo(config.typeaheadOp)).toHaveLength(0)
      h.destroy()
    })

    if (minSearchStrLength > 0) {
      it('lists nothing until the search reaches its minimum length', async () => {
        const h = await setup()
        h.openDropdown()
        await h.settle()
        expect(h.callsTo(config.typeaheadOp)).toHaveLength(0)

        h.type('x'.repeat(minSearchStrLength - 1))
        await h.settle()
        expect(h.callsTo(config.typeaheadOp)).toHaveLength(0)
        h.destroy()
      })
    } else {
      it('lists everything when the dropdown opens', async () => {
        const h = await setup()
        h.openDropdown()
        await h.settle()
        expect(h.callsTo(config.typeaheadOp)).toHaveLength(1)
        expect(h.callsTo(config.typeaheadOp)[0].variables).toEqual(
          config.emptySearchVars
        )
        expect(h.optionItems()).toHaveLength(
          config.optionCount ?? config.records.length
        )
        h.destroy()
      })
    }

    it('debounces keystrokes into a single query', async () => {
      const h = await setup()
      h.openDropdown()
      await h.settle()
      const before = h.callsTo(config.typeaheadOp).length

      for (let i = 1; i <= term.length; i++) h.type(term.slice(0, i))
      await h.settle()

      expect(h.callsTo(config.typeaheadOp).length - before).toBe(1)
      expect(h.callsTo(config.typeaheadOp).at(-1)!.variables).toEqual(
        config.searchVars(term)
      )
      h.destroy()
    })

    it('renders an option per result', async () => {
      const h = await setup()
      await showOptions(h)
      const text = h
        .optionItems()
        .map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
        .join('|')
      expect(text).toContain(first.name)
      expect(text).toContain(second.name)
      h.destroy()
    })

    it('sets the control to a bare id when an option is selected', async () => {
      const h = await setup()
      await showOptions(h)
      h.optionItems()[1].click()
      await h.settle()
      expect(h.control().value).toBe(second.id)
      h.destroy()
    })

    it('sets the control to an array of bare ids in multi-select mode', async () => {
      const h = await setup({ type: config.multiType })
      await showOptions(h)
      h.optionItems()[0].click()
      await h.settle()
      expect(h.control().value).toEqual([first.id])
      h.destroy()
    })

    it('renders the selected item as a tag from the cache', async () => {
      const h = await setup()
      await showOptions(h)
      h.optionItems()[0].click()
      await h.settle()
      // scoped to the entity select: a field may render a parameter picker
      // whose own selected item would otherwise match first
      const selected = h.selectedItem()
      expect(selected.textContent).toContain(first.name)
      h.destroy()
    })

    it('fetches a prepopulated value and marks the control touched', async () => {
      const h = await setup({ model: { [config.key]: first.id } })
      await h.settle()
      expect(h.callsTo(config.tagOp)).toHaveLength(1)
      expect(h.callsTo(config.tagOp)[0].variables).toEqual(
        config.tagVars(first.id)
      )
      expect(h.control().touched).toBe(true)
      expect(h.fixture.nativeElement.textContent).toContain(first.name)
      h.destroy()
    })

    it('clears the field when the selected tag is closed', async () => {
      const h = await setup({ model: { [config.key]: first.id } })
      await h.settle()
      const close = h.fixture.nativeElement.querySelector(
        'nz-tag .ant-tag-close-icon'
      ) as HTMLElement
      expect(close).toBeTruthy()
      close.click()
      await h.settle()
      expect(h.control().value).toBeUndefined()
      h.destroy()
    })

    it('publishes its value into the form state under its own key', async () => {
      const { formState, stateField } = statePublicationProbe<number>(
        config.key,
        config.formState?.() ?? {}
      )
      const h = await setup({ formState })
      await showOptions(h)
      h.optionItems()[1].click()
      await h.settle()
      expect(stateField()).toBe(second.id)
      h.destroy()
    })

    if (config.hasQuickAdd !== false) {
      it('appends a quick-added entity to a multi-select rather than replacing it', async () => {
        const h = await setup({
          type: config.multiType,
          model: { [config.key]: [first.id] },
        })
        await h.settle()
        expect(h.control().value).toEqual([first.id])

        h.quickAdd(config.fieldType, second.id)
        await h.settle()

        expect(h.control().value).toEqual([first.id, second.id])
        h.destroy()
      })

      it('does not duplicate an id already selected in a multi-select', async () => {
        const h = await setup({
          type: config.multiType,
          model: { [config.key]: [first.id] },
        })
        await h.settle()
        h.quickAdd(config.fieldType, first.id)
        await h.settle()
        expect(h.control().value).toEqual([first.id])
        h.destroy()
      })

      it('replaces the value when a quick-added entity lands in a single select', async () => {
        const h = await setup({ model: { [config.key]: first.id } })
        await h.settle()
        h.quickAdd(config.fieldType, second.id)
        await h.settle()
        expect(h.control().value).toBe(second.id)
        h.destroy()
      })
    }
  })
}

export interface TypeGateContractConfig<
  TField extends { props: CvcTypeGatedSelectFieldProps },
> {
  /** the field component class, used to reach the mounted instance's props */
  fieldType: Type<TField>
  /** registered single-select type name */
  type: string
  key: string
  respond: (op: MockGraphqlOperation) => Record<string, any>
  /**
   * The real state class the field's forms provide, fresh per test. The
   * contract drives the gate the way the form's type-select would: by
   * writing the entity type into the state and letting the requires/enums
   * computeds derive from it.
   */
  formState: () => BaseState
  /** the state slot the gate derives from, e.g. 'evidenceType' */
  typeKey: string
  /** an entity type under which the state requires this field */
  requiredType: EntityType
  /** an entity type under which the state excludes this field */
  excludedType: EntityType
  /** the field's `typeGate.requiresKey`, for the misconfiguration report */
  requiresKey: string
  /** a control value whose tag query `respond` can answer */
  value: number | number[]
  /** a distinctive fragment of the field's excluded-type description */
  excludedPhrase: string
}

/**
 * The behavior every type-gated select inherits from
 * CvcTypeGatedSelectFieldBase: the three gate postures (awaiting a type,
 * required by it, excluded by it), the two value-reset branches, first-run
 * ordering, and the misconfigured-state reports. Call inside the field's
 * `describe`, alongside `describeEntitySelectContract`.
 *
 * Fields that override `onTypeGateApplied` to manage their own description
 * still pass: the contract asserts required/disabled/reset behavior in all
 * postures, and description content only where the base's wording must
 * survive (the excluded posture's explanation).
 */
export function describeTypeGateContract<
  TField extends { props: CvcTypeGatedSelectFieldProps },
>(config: TypeGateContractConfig<TField>): void {
  const setType = (state: BaseState, et: Maybe<EntityType>) =>
    (state.fields[config.typeKey] as WritableSignal<Maybe<EntityType>>).set(et)

  const mount = (
    formState: unknown,
    overrides: Partial<SelectFieldHarnessConfig> = {}
  ) =>
    createSelectFieldHarness({
      type: config.type,
      key: config.key,
      respond: config.respond,
      formState,
      ...overrides,
    })

  const props = (h: SelectFieldHarness): CvcTypeGatedSelectFieldProps =>
    h.field(config.fieldType).props

  const selectEl = (h: SelectFieldHarness): HTMLElement =>
    h.fixture.nativeElement.querySelector('nz-select[cvcEntitySelect]') ??
    h.fixture.nativeElement.querySelector('nz-select')

  const isDisabled = (h: SelectFieldHarness) =>
    selectEl(h).classList.contains('ant-select-disabled')

  describe('type-gate contract', () => {
    it('disables itself and prompts for the entity type until one is chosen', async () => {
      const h = await mount(config.formState())
      const p = props(h)
      expect(p.disabled).toBe(true)
      expect(p.required).toBe(false)
      expect(p.extraType).toBe('prompt')
      expect(p.description).toBeTruthy()
      expect(isDisabled(h)).toBe(true)
      h.destroy()
    })

    it('enables and requires itself when the chosen type requires it', async () => {
      const state = config.formState()
      const h = await mount(state)
      setType(state, config.requiredType)
      await h.settle(0)
      const p = props(h)
      expect(p.required).toBe(true)
      expect(p.disabled).toBe(false)
      expect(isDisabled(h)).toBe(false)
      h.destroy()
    })

    it('disables itself and explains why when the chosen type excludes it', async () => {
      const state = config.formState()
      const h = await mount(state)
      setType(state, config.excludedType)
      await h.settle(0)
      const p = props(h)
      expect(p.required).toBe(false)
      expect(p.disabled).toBe(true)
      expect(p.extraType).toBe('prompt')
      expect(p.description).toContain(config.excludedPhrase)
      expect(isDisabled(h)).toBe(true)
      h.destroy()
    })

    it('drops a selected value when the type changes to one that excludes it', async () => {
      const state = config.formState()
      const h = await mount(state)
      setType(state, config.requiredType)
      await h.settle(0)
      h.control().setValue(config.value)
      await h.settle(0)
      expect(h.control().value).toEqual(config.value)

      setType(state, config.excludedType)
      await h.settle(0)
      expect(h.control().value).toBeUndefined()
      h.destroy()
    })

    it('drops the value and prompts again when the entity type is cleared', async () => {
      const state = config.formState()
      const h = await mount(state)
      setType(state, config.requiredType)
      await h.settle(0)
      h.control().setValue(config.value)
      await h.settle(0)

      setType(state, undefined)
      await h.settle(0)
      expect(h.control().value).toBeUndefined()
      const p = props(h)
      expect(p.disabled).toBe(true)
      expect(p.extraType).toBe('prompt')
      h.destroy()
    })

    it('keeps a prepopulated value on first run when the state already holds its type', async () => {
      // in a real form the type field publishes during the same ngOnInit
      // round, before any effect flushes — a revise form's state is therefore
      // already typed when the gate first runs, and must not clear the model
      const state = config.formState()
      setType(state, config.requiredType)
      const h = await mount(state, { model: { [config.key]: config.value } })
      expect(h.control().value).toEqual(config.value)
      expect(props(h).required).toBe(true)
      h.destroy()
    })

    it('stays ungated when a hand-built state lacks its requires key', async () => {
      // unrepresentable in typed app code (EntityRequires is total), but the
      // formly `any` boundary can still deliver it — the gate must not crash
      const { formState } = statePublicationProbe(config.key, {
        requires: {},
      })
      const h = await mount(formState)
      expect(props(h).disabled).not.toBe(true)
      expect(isDisabled(h)).toBe(false)
      h.destroy()
    })

    it('is not gated by a form that provides no requires map', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        const { formState } = statePublicationProbe(config.key, {})
        const h = await mount(formState)
        expect(
          warn.mock.calls.some((args) =>
            String(args[0]).includes(config.requiresKey)
          )
        ).toBe(false)
        expect(props(h).disabled).not.toBe(true)
        expect(isDisabled(h)).toBe(false)
        h.destroy()
      } finally {
        warn.mockRestore()
      }
    })
  })
}
