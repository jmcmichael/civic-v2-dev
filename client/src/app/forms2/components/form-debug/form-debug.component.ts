import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Maybe } from '@app/generated/civic.apollo';

@Component({
  selector: 'cvc-form-debug',
  templateUrl: './form-debug.component.html',
  styleUrls: ['./form-debug.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvcFormDebugComponent implements OnInit {
  @Input() cvcModel: any;
  @Input() cvcForm: Maybe<AbstractControl>;

  selectedIndex = 0;

  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.');
  }
}
