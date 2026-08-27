import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { QuestionCircleFill } from '@ant-design/icons-angular/icons'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import { FormMutationService } from '@app/forms/utilities/form-mutation'
import {
  MockGraphqlOperation,
  graphqlErrors,
  provideMockApollo,
} from '@app/testing/apollo-test.providers'
import { FormlyModule } from '@ngx-formly/core'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcMpComponentsModule } from '../mp-components.module'
import { MpExpressionEditorComponent } from './mp-expression-editor.component'

const textSegment = (text: string) => ({
  __typename: 'MolecularProfileTextSegment' as const,
  text,
})
const variantSegment = (id: number, name: string) => ({
  __typename: 'Variant' as const,
  id,
  name,
  link: `/variants/${id}`,
  deprecated: false,
  flagged: false,
})
const molecularProfile = (id: number, name: string) => ({
  __typename: 'MolecularProfile' as const,
  id,
  name,
  link: `/molecular-profiles/${id}`,
  deprecated: false,
  flagged: false,
})
const preview = (segments: any[], existingMolecularProfile: any = null) => ({
  previewMolecularProfileName: {
    __typename: 'MolecularProfileNamePreview',
    existingMolecularProfile,
    segments,
    deprecatedVariants: [],
  },
})

// outlives the 250ms input debounce plus a settle margin
const debounce = () => new Promise((resolve) => setTimeout(resolve, 300))
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('MpExpressionEditorComponent', () => {
  let handler: (op: MockGraphqlOperation) => any
  let recorded: MockGraphqlOperation[]
  let fixture: ComponentFixture<MpExpressionEditorComponent>
  let component: MpExpressionEditorComponent

  beforeEach(() => {
    handler = () => preview([variantSegment(12, 'V600E')])
    recorded = []
    TestBed.configureTestingModule({
      imports: [CvcMpComponentsModule, FormlyModule.forRoot({})],
      providers: [
        provideNoopAnimations(),
        provideNzIcons([QuestionCircleFill]),
        provideMockApollo((op) => handler(op), recorded),
        {
          provide: ViewerService,
          useValue: { viewer$: of({ mostRecentOrg: { id: 5 } }) },
        },
        { provide: FormMutationService, useValue: { mutate: vi.fn() } },
      ],
    })
    fixture = TestBed.createComponent(MpExpressionEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('starts with the initial guidance message and no preview', () => {
    expect(component.expressionMessage()).toContain('construct')
    expect(component.expressionSegment()).toBeUndefined()
    expect(component.expressionError()).toBeUndefined()
    expect(component.showMpActions()).toBe(false)
  })

  it('reports a parse error without querying the server', async () => {
    component.onInput('XYZ123')
    await debounce()
    expect(component.expressionError()?.errorMessage).toContain('XYZ123')
    expect(component.expressionMessage()).toBeUndefined()
    expect(component.expressionSegment()).toBeUndefined()
    expect(recorded).toHaveLength(0)
  })

  it('previews a valid expression and offers creation when no MP exists', async () => {
    component.onInput('#VID12')
    await debounce()
    expect(recorded).toHaveLength(1)
    expect(recorded[0].variables.mpStructure).toBeDefined()
    expect(component.expressionSegment()).toHaveLength(1)
    expect(component.showMpActions()).toBe(true)
    expect(component.existingMp()).toBeUndefined()
  })

  it('offers selection when the previewed MP already exists', async () => {
    handler = () =>
      preview([variantSegment(12, 'V600E')], molecularProfile(41, 'BRAF V600E'))
    component.onInput('#VID12')
    await debounce()
    expect(component.existingMp()?.name).toBe('BRAF V600E')
  })

  it('a server rejection becomes a queryError alert and drops the stale preview', async () => {
    // regression: Apollo Client 4 rejects on GraphQL errors, and the old
    // .then(({ data, error }) => ...) branch never ran — the editor kept
    // showing the previous valid preview and its Create New MP offer
    component.onInput('#VID12')
    await debounce()
    expect(component.expressionSegment()).toBeDefined()

    handler = () =>
      graphqlErrors(
        'You may not use the same variant multiple times in one MP expression.'
      )
    component.onInput('#VID12 AND #VID12')
    await debounce()

    const error = component.expressionError()
    expect(error?.errorType).toBe('queryError')
    expect(error?.errorMessage).toContain('multiple times')
    expect(component.expressionSegment()).toBeUndefined()
    expect(component.showMpActions()).toBe(false)
  })

  it('a slow stale response cannot overwrite a newer preview', async () => {
    // regression: the imperative refetch().then() seam had no cancellation,
    // so a slow earlier preview could resolve late and clobber a newer one
    let releaseSlow!: (value: any) => void
    handler = () => new Promise((resolve) => (releaseSlow = resolve))
    component.onInput('#VID12')
    await debounce()

    handler = () => preview([variantSegment(33, 'L858R')])
    component.onInput('#VID33')
    await debounce()
    expect(component.expressionSegment()?.[0]).toMatchObject({ name: 'L858R' })

    releaseSlow(preview([variantSegment(12, 'V600E')]))
    await flush()
    expect(component.expressionSegment()?.[0]).toMatchObject({ name: 'L858R' })
  })

  it('clearing the input restores the initial message', async () => {
    component.onInput('#VID12')
    await debounce()
    component.onInput('')
    await debounce()
    expect(component.expressionMessage()).toContain('construct')
    expect(component.expressionSegment()).toBeUndefined()
  })

  it('builds expressions from the append and variant helpers', () => {
    component.appendInput('(')
    expect(component.inputValue()).toBe('(')
    component.selectVariant({ variant: { id: 12 } as any, prependNot: false })
    expect(component.inputValue()).toBe('( #VID12')
    // selecting the same variant twice appends it once
    component.selectVariant({ variant: { id: 12 } as any, prependNot: false })
    expect(component.inputValue()).toBe('( #VID12')
    component.appendInput('AND')
    component.selectVariant({ variant: { id: 33 } as any, prependNot: true })
    expect(component.inputValue()).toBe('( #VID12 AND NOT #VID33')
  })
})
