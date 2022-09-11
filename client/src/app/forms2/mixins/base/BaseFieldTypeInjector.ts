import {
  Input,
  Directive,
} from '@angular/core'
import { FormlyFieldConfig } from '@ngx-formly/core'

@Directive()
export abstract class BaseFieldTypeDirective<
  F extends FormlyFieldConfig = FormlyFieldConfig
> {
  @Input() field: F;
  defaultOptions?: Partial<F>;

  constructor() {}

}

type GConstructor<T = {}> = new (...args: any[]) => T

export type BaseFieldTypeConstructor = GConstructor<BaseFieldTypeDirective>

export class BaseFieldType extends BaseFieldTypeDirective {}
