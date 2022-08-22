import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'cvc-gene-input',
  templateUrl: './gene-input.type.html',
  styleUrls: ['./gene-input.type.less']
})
export class CvcGeneInputType extends FieldType<FieldTypeConfig> implements OnInit {

  constructor() { super()}

  ngOnInit(): void {
  }

}
