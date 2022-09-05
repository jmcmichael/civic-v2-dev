import { Component, Input } from '@angular/core';
import { LinkableEntity } from '../../entity-tag/entity-tag.component';

export interface EntitySelectOptionItem extends LinkableEntity {
  data?: {
    [key: string]: any
  }
}

@Component({
  selector: 'cvc-entity-select-option',
  templateUrl: './entity-select-option.component.html',
  styleUrls: ['./entity-select-option.component.less']
})
export class EntitySelectOptionComponent {
  @Input() cvcOptionItem!: EntitySelectOptionItem
  @Input() cvcSearchString?: string
  constructor() { }

}
