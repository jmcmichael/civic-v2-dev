import { ApplicationRef, enableProdMode } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { create, CyclePlugin } from 'rxjs-spy';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
  // enable RXjs Spy on non production bulds only

  // const spy = create();

  // deactivate CyclePlugin, which spams console w/
  // an alert about a next cycle in table-scroll.directive.
  // Re-activate to troubleshoot if a 'call stack exceeded' error occurs.

  // spy.unplug(spy.find(CyclePlugin) as CyclePlugin);

  // we call show for two purposes: first is to log to
  // the console an empty snapshot so we can see that
  // everything is working as expected, then to suppress
  // unused variable usage (a convention)

  // spy.show();

  // log everything, provide tag name to focus log on a single observable

  // spy.log();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((moduleRef) => {
    // activate ng.profiler
    // Usage: in the devtools console, enter 'ng.profiler.timeChangeDetection({ record: true })' to change detection cycle report. Use Angular DevTools' profiler tab to record a change detection session, and get a breakdown of components' detection cycle times. The 'record: true' option supposedly works with Chrome's profiler but I didn't see how.
    if (!environment.production) {
      const applicationRef = moduleRef.injector.get(ApplicationRef)
      const componentRef = applicationRef.components[0]
      enableDebugTools(componentRef)
    }
  })
  .catch((err) => console.error(err));
