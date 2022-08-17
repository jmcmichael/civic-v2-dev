import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveComponentModule } from '@ngrx/component'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { FormDebugFieldListComponent } from './form-debug-field-list/form-debug-field-list.component'
import { CvcFormDebugComponent } from './form-debug.component'

@NgModule({
  declarations: [CvcFormDebugComponent, FormDebugFieldListComponent],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    NzIconModule,
    NzGridModule,
    NzCardModule,
    NzTabsModule,
    NzDescriptionsModule,
    NzListModule,
    NzTagModule,

    NgxJsonViewerModule,
  ],
  exports: [CvcFormDebugComponent],
})
export class CvcFormDebugComponentModule {}
