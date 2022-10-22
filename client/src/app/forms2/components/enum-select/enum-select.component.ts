import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, TrackByFunction } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/models';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';

@Component({
  selector: 'cvc-enum-select',
  templateUrl: './enum-select.component.html',
  styleUrls: ['./enum-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcEnumSelectComponent {
  @Input() cvcFormControl!: FormControl
  @Input() cvcFormlyAttributes!: FormlyFieldConfig
  @Input() cvcEnumName: string = 'Attribute'
  @Input() cvcSelectMode: 'multiple' | 'tags' | 'default' = 'default'
  @Input() cvcPlaceholder: string = 'Select an option'
  @Input() cvcOptions?: NzSelectOptionInterface[] = []
  @Input() cvcShowError: boolean = false
  @Input() cvcDisabled: boolean = false
  @Input() cvcAllowClear: boolean = true
  @Input() cvcOptionTrackBy!: TrackByFunction<any>
  @Input() cvcModelChange?: FormlyAttributeEvent
  // custom template for field value render
  @Input() cvcCustomTemplate?: TemplateRef<any> | null = null
  @Output() readonly cvcOnFocus = new EventEmitter<void>()

  constructor() { }

}
