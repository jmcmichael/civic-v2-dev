import { Component } from '@angular/core'
import { FieldType, FieldTypeConfig } from '@ngx-formly/core'

@Component({
  selector: 'cvc-form-summary',
  templateUrl: './form-summary.component.html',
  styleUrls: ['./form-summary.component.less'],
})
export class CvcFormSummaryComponent extends FieldType<FieldTypeConfig> {
  constructor() {
    super()
  }
}
