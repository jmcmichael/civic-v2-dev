import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms'
import {
  CheckCircleOutline,
  ExclamationCircleOutline,
} from '@ant-design/icons-angular/icons'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NZ_ICONS } from 'ng-zorro-antd/icon'
import { describe, expect, it } from 'vitest'
import { CvcFormFieldWrapperModule } from './form-field.module'

@Component({
  template: `
    <form [formGroup]="form">
      <formly-form
        [form]="form"
        [fields]="fields"
        [model]="model">
      </formly-form>
    </form>
  `,
  imports: [ReactiveFormsModule, FormlyModule, CvcFormFieldWrapperModule],
})
class HostComponent {
  form = new UntypedFormGroup({})
  model: Record<string, unknown> = {}
  fields: FormlyFieldConfig[] = []
}

function mount(
  props: Record<string, unknown>,
  model: Record<string, unknown> = {}
): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [HostComponent, FormlyModule.forRoot({ types: [] })],
    providers: [
      {
        provide: NZ_ICONS,
        useValue: [CheckCircleOutline, ExclamationCircleOutline],
      },
    ],
  })
  const fixture = TestBed.createComponent(HostComponent)
  fixture.componentInstance.model = model
  fixture.componentInstance.fields = [
    { key: 'a', wrappers: ['form-field'], props: { label: 'Field A', ...props } },
  ]
  fixture.detectChanges()
  return fixture
}

/** the marker element, or '' when the label carries none */
function marker(fixture: ComponentFixture<HostComponent>): string {
  const el = fixture.nativeElement.querySelector('.field-marker')
  if (!el) return ''
  if (el.classList.contains('marker-circle')) {
    return el.classList.contains('filled') ? 'filled-circle' : 'circle'
  }
  return el.getAttribute('nztype') ?? el.getAttribute('nzType') ?? 'icon'
}

function touch(fixture: ComponentFixture<HostComponent>): void {
  fixture.componentInstance.form.get('a')!.markAsTouched()
  fixture.detectChanges()
}

describe('form-field wrapper label marker', () => {
  it('rings an optional field', () => {
    expect(marker(mount({}))).toBe('circle')
  })

  it('fills the ring on a required field still waiting on a value', () => {
    expect(marker(mount({ required: true }))).toBe('filled-circle')
  })

  it('marks a touched required field that is still empty as an error', () => {
    const fixture = mount({ required: true })
    touch(fixture)
    expect(marker(fixture)).toBe('exclamation-circle')
  })

  it('marks a touched field that passes as ok', () => {
    const fixture = mount({ required: true }, { a: 'filled in' })
    touch(fixture)
    expect(marker(fixture)).toBe('check-circle')
  })
})
