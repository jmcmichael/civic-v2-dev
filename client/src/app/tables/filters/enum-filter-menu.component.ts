import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core'
import { CvcAttributeTagModule } from '@app/forms/components/attribute-tag/attribute-tag.module'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { CvcEnumOption } from '../entity-table.types'

/**
 * The dropdown behind an enum column's funnel icon: one tag per value, plus a
 * reset.
 *
 * `cvc-attribute-tag` is imported from `@app/forms/components/attribute-tag`,
 * **not** `@app/components/shared/attribute-tag` — two different components
 * share that selector, and this is the forms-side one.
 */
@Component({
  selector: 'cvc-enum-filter-menu',
  imports: [CvcAttributeTagModule, NzButtonModule, NzIconModule, NzMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul nz-menu>
      @for (option of options(); track option.value) {
        <li
          nz-menu-item
          [nzSelected]="selected() === option.value"
          [attr.aria-label]="option.label"
          (click)="selectedChange.emit(option.value)">
          <!-- the tag renders the value's own label and icon; option.label is
               the accessible name, since the tag is the only visible content -->
          <!-- $any because cvc-attribute-tag types cvcAttrValue as
               CvcInputEnum, a union of generated string enums, while the
               evidence rating column filters on the numbers 1-5 and renders
               them through the same tag. Widening that input to cover the
               numeric case belongs to the attribute-tag component, not
               here. -->
          <cvc-attribute-tag
            [cvcFullWidth]="true"
            cvcContext="menu-item"
            [cvcChecked]="selected() === option.value"
            [cvcAttrValue]="$any(option.value)" />
        </li>
      }
      <li style="padding: 3px">
        <button
          nz-button
          nzType="default"
          nzBlock
          nzSize="small"
          [disabled]="selected() === null"
          (click)="selectedChange.emit(null)">
          <span
            nz-icon
            nzType="retweet"
            nzTheme="outline"></span>
          Reset
        </button>
      </li>
    </ul>
  `,
})
export class CvcEnumFilterMenuComponent {
  readonly options = input.required<ReadonlyArray<CvcEnumOption<unknown>>>()
  readonly selected = input<unknown>(null)

  readonly selectedChange = output<unknown>()
}
