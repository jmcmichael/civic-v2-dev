import { Injectable, OnInit } from '@angular/core';
import { BaseInjectorConstructor } from 'ng-mix';

export const hasValueChangesMixin = <Tbase extends BaseInjectorConstructor>(superClass: Tbase) => {

  @Injectable()
  abstract class hasValueChanges extends superClass implements OnInit {
	
    // You can inject services from the BaseClassInjector i.e
    // myService = this.injector.get(MyService);

    ngOnInit(): void {
      //Call super's lifecycle method
      super.ngOnInit();

      //Implementation here
    }		
  }

  return hasValueChanges;
}
