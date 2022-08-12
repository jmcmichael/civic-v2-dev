import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cvc-form-debug-panel',
  templateUrl: './form-debug-panel.component.html',
  styleUrls: ['./form-debug-panel.component.less']
})
export class FormDebugPanelComponent implements OnInit {
  @Input() cvcModel: any
  selectedIndex = 0

  constructor() { }

  ngOnInit(): void {
    console.log('form-debug-panel onInit() called.')
  }

}
