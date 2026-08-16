import { ChangeDetectionStrategy, Component, model, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

/**
 * The text/numeric filter box in a column header.
 *
 * One copy, replacing the byte-identical templates under both managers whose
 * components differed only by a `cvc-variant-` selector prefix.
 *
 * Change detection is Default, not OnPush: the value is a `model()` written on
 * every keystroke, and the suffix icon flips between search and clear based on
 * it. The originals said the same thing by setting `Eager` explicitly.
 */
@Component({
  selector: 'cvc-table-filter-input',
  imports: [FormsModule, NzIconModule, NzInputModule, NzInputNumberModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (kind() === 'numeric') {
      <nz-input-number
        nzSize="small"
        [nzPlaceHolder]="placeholder() ?? ''"
        [ngModel]="value()"
        (ngModelChange)="value.set($event === '' ? null : $event)"
        [nzMin]="1"
        [nzStep]="1"
        style="width: 100%" />
    } @else {
      <!-- nzSize belongs on the nz-input directive; NzInputWrapperComponent has
           no such input, so setting it on the wrapper (as the originals did)
           silently does nothing -->
      <nz-input-wrapper>
        <input
          nz-input
          nzSize="small"
          [placeholder]="placeholder() ?? ''"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)" />
        <span nzInputSuffix>
          @if (value()) {
            <span
              nz-icon
              class="ant-input-clear-icon"
              nzTheme="fill"
              nzType="close-circle"
              (click)="value.set(null)"></span>
          } @else {
            <span
              nz-icon
              nzType="search"
              style="color: #ddd"></span>
          }
        </span>
      </nz-input-wrapper>
    }
  `,
})
export class CvcTableFilterInputComponent {
  readonly kind = input<'text' | 'numeric'>('text')
  readonly placeholder = input<string>()

  /**
   * `null` rather than `undefined` for "cleared": nz-table's own filter and sort
   * types use null for unset, and the table converts it to `undefined` at the
   * query boundary so the variable is omitted rather than sent as null.
   */
  readonly value = model<string | number | null>(null)
}
