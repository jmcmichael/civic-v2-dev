import { AfterViewInit, Component, Injectable } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { MixinConstructor } from 'ts-mixin-extended'

export function HasValueChanges<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Injectable()
  abstract class HasValueChanges extends Base {
    testValueChange$!: Subject<any>
    // constructor(...args: any[]) {
    //   super(...args)
    //   this.testValueChange$ = new Subject<any>()
    // }

    ngAfterViewInit(): void {
      console.log('has-value-changes ngAfterViewInit()')
      this.testValueChange$ = new Subject<any>()
    }
  }

  return HasValueChanges
}
