import { ChangeDetectionStrategy, Component, model, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

/**
 * The text/numeric filter box in a column header.
 *
 * Change detection is Default, not OnPush: the value is a `model()` written on
 * every keystroke, and the suffix icon flips between search and clear based on
 * it.
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
      <!-- No nzSize here, deliberately. It would belong on the nz-input
           directive (<nz-input-wrapper> has no such input and ignores it),
           and setting it there shrinks the box to 22px — matching the
           existing tables means leaving it off. -->
      <nz-input-wrapper>
        <input
          nz-input
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
