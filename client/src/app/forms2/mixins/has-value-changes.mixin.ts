import { AfterViewInit, Component } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { MixinConstructor } from 'ts-mixin-extended'

export function HasValueChanges<TBase extends MixinConstructor<FieldType>>(
  Base: TBase
) {
  @Component({ template: '' })
  abstract class HasValueChanges extends Base implements AfterViewInit {
    testValueChange$: Subject<any>
    constructor(...args: any[]) {
      super(...args)
      this.testValueChange$ = new Subject<any>()
    }

    ngAfterViewInit(): void {
      console.log('has-value-changes ngAfterViewInit()')
    }
  }

  return HasValueChanges
}

// import { Injectable, OnInit } from '@angular/core';
// import { BaseInjectorConstructor } from 'ng-mix';

// export const hasValueChangesMixin = <Tbase extends BaseInjectorConstructor>(superClass: Tbase) => {

//   @Injectable()
//   abstract class hasValueChanges extends superClass implements OnInit {

//     // You can inject services from the BaseClassInjector i.e
//     // myService = this.injector.get(MyService);

//     ngOnInit(): void {
//       //Call super's lifecycle method
//       super.ngOnInit();

//       //Implementation here
//     }
//   }

//   return hasValueChanges;
// }
