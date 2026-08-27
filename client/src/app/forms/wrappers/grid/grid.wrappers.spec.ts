import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms'
import {
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core'
import { describe, expect, it } from 'vitest'
import { CvcGridWrappersModule } from './grid.wrappers.module'

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
  imports: [ReactiveFormsModule, FormlyModule, CvcGridWrappersModule],
})
class HostComponent {
  form = new UntypedFormGroup({})
  model = {}
  fields: FormlyFieldConfig[] = []
}

function mount(fields: FormlyFieldConfig[]): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [
      HostComponent,
      FormlyModule.forRoot({ types: [] }),
      CvcGridWrappersModule,
    ],
  })
  const fixture = TestBed.createComponent(HostComponent)
  fixture.componentInstance.fields = fields
  fixture.detectChanges()
  return fixture
}

describe('row + col wrappers', () => {
  it('renders a field group as an nz-row of per-field nz-cols', () => {
    const fixture = mount([
      {
        wrappers: ['row'],
        fieldGroup: [
          { key: 'a', wrappers: ['col'], props: { col: { span: 8 } } },
          { key: 'b', wrappers: ['col'], props: { col: { span: 16 } } },
        ],
      },
    ])
    const el: HTMLElement = fixture.nativeElement
    const row = el.querySelector('nz-row')
    expect(row).toBeTruthy()
    const cols = row!.querySelectorAll('nz-col')
    expect(cols.length).toBe(2)
    expect(cols[0].classList).toContain('ant-col-8')
    expect(cols[1].classList).toContain('ant-col-16')
  })

  it('sizes each col from its own field, not by position', () => {
    // inserting a field mid-row must not reassign its siblings' widths —
    // the failure mode of form-row's *Indexed modes
    const colB = { key: 'b', wrappers: ['col'], props: { col: { span: 16 } } }
    const fixture = mount([
      {
        wrappers: ['row'],
        fieldGroup: [
          { key: 'a', wrappers: ['col'], props: { col: { span: 8 } } },
          { key: 'inserted', wrappers: ['col'], props: { col: { span: 24 } } },
          colB,
        ],
      },
    ])
    const cols = fixture.nativeElement.querySelectorAll('nz-col')
    expect(cols[2].classList).toContain('ant-col-16')
  })

  it('defaults a config-less col to full width', () => {
    const fixture = mount([
      {
        wrappers: ['row'],
        fieldGroup: [{ key: 'a', wrappers: ['col'] }],
      },
    ])
    const col = fixture.nativeElement.querySelector('nz-col')
    expect(col.classList).toContain('ant-col-24')
  })

  it('applies responsive breakpoint classes from props.col', () => {
    const fixture = mount([
      {
        wrappers: ['row'],
        fieldGroup: [
          {
            key: 'a',
            wrappers: ['col'],
            props: { col: { xs: 24, md: 12, xxl: 6 } },
          },
        ],
      },
    ])
    const col = fixture.nativeElement.querySelector('nz-col')
    expect(col.classList).toContain('ant-col-xs-24')
    expect(col.classList).toContain('ant-col-md-12')
    expect(col.classList).toContain('ant-col-xxl-6')
  })
})
