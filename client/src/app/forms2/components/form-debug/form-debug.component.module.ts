import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { environment } from "environments/environment";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzListModule } from "ng-zorro-antd/list";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { CvcFormDebugComponent } from "./form-debug.component";
import { FormDebugFieldListComponent } from './form-debug-field-list/form-debug-field-list.component';
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzGridModule } from "ng-zorro-antd/grid";
import { ReactiveComponentModule } from "@ngrx/component";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzDestroyService } from "ng-zorro-antd/core/services";
import { NzDescriptionsModule } from "ng-zorro-antd/descriptions";

@NgModule({
    declarations:[CvcFormDebugComponent, FormDebugFieldListComponent],
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
        ...environment.devModules
    ],
    exports:[CvcFormDebugComponent],
})
export class CvcFormDebugComponentModule {}
