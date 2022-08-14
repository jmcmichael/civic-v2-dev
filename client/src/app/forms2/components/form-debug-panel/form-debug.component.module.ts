import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { environment } from "environments/environment";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzListModule } from "ng-zorro-antd/list";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { CvcFormDebugComponent } from "./form-debug.component";

@NgModule({
    declarations:[CvcFormDebugComponent],
    imports: [
        CommonModule,
        NzCardModule,
        NzTabsModule,
        NzListModule,
        ...environment.devModules
    ],
    exports:[CvcFormDebugComponent],
})
export class CvcFormDebugComponentModule {}
