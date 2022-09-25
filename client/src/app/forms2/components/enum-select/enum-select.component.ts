import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { SelectOption } from '@app/forms2/states/entity.state';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'cvc-enum-select',
  templateUrl: './enum-select.component.html',
  styleUrls: ['./enum-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcEnumSelectComponent {
  @Input() cvcFormControl!: UntypedFormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcPlaceholder: string = 'Select an option'
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcModelChange?: Subject<any>
  @Input() cvcSelectOptions?: SelectOption[]

  constructor() { }

}
