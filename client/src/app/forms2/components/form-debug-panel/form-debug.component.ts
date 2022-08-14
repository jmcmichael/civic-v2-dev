import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Maybe } from '@app/generated/civic.apollo';

@Component({
  selector: 'cvc-form-debug-panel',
  templateUrl: './form-debug.component.html',
  styleUrls: ['./form-debug.component.less']
})
export class CvcFormDebugComponent implements OnInit {
  _cvcFormControl: Maybe<AbstractControl>
  formControl: Maybe<FormGroup>
  @Input() cvcFieldTitle!: string
  @Input() cvcModel: any
  // TODO: accept FormArray
  @Input()
  set cvcFormControl(fc: Maybe<AbstractControl>) {
    if(!fc) throw new Error(`cvc-form-debug-panel requires valid cvcFormControl Input.`)
    this._cvcFormControl = fc
    this.formControl = fc as FormGroup
  }
  get cvcFormControl(): Maybe<AbstractControl> {
    return this._cvcFormControl
  }

  selectedIndex = 0
  constructor() { }

  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.')
  }

}
