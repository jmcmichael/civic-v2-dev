import { Component, ChangeDetectionStrategy } from '@angular/core'
import { Location } from '@angular/common'
import { FieldType } from '@ngx-formly/core'
import { Router } from '@angular/router'

@Component({
  selector: 'cvc-cancel-button',
  templateUrl: './cancel-button.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcCancelButton extends FieldType<any> {
  constructor(private location: Location) {
    super()
  }

  cancelClicked() {
    this.location.back()
  }
}
