import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl } from '@angular/forms'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

@Component({
  selector: 'cvc-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcEntitySelectComponent {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled?: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcOnFocus?: Subject<boolean>
  @Input() cvcOnSearch?: Subject<string>
  @Input() cvcResults!: Observable<any[]>
  @Input() cvcModelChange?: FormlyAttributeEvent

  _placeholder = new BehaviorSubject<string>('')
  @Input()
  set cvcPlaceholder(p: string | BehaviorSubject<string>) {
    if (typeof p === 'string') this._placeholder.next(p)
    else {
      this._placeholder = p
    }
  }
  get cvcPlaceholder(): BehaviorSubject<string> {
    return this._placeholder
  }
  constructor() {}
}
