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
import { NzTableFilterList } from 'ng-zorro-antd/table'

/**
 * The dropdown behind an enum column's funnel icon: one tag per value, plus a
 * reset. One copy, replacing the byte-identical pair under the two managers.
 *
 * `cvc-attribute-tag` is imported from `@app/forms/components/attribute-tag`,
 * **not** `@app/components/shared/attribute-tag` — two different components share
 * that selector, and this is the one the managers render.
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
          (click)="selectedChange.emit(option.value)">
          <cvc-attribute-tag
            [cvcFullWidth]="true"
            cvcContext="menu-item"
            [cvcChecked]="selected() === option.value"
            [cvcAttrValue]="option.value" />
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
  readonly options = input.required<NzTableFilterList>()
  readonly selected = input<unknown>(null)

  readonly selectedChange = output<unknown>()
}
