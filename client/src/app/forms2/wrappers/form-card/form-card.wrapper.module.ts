import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcOrgSelectorBtnGroupModule } from '@app/forms/config/components/org-selector-btn-group/org-selector-btn-group.module';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { environment } from 'environments/environment';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CvcFormCardWrapper } from './form-card.wrapper';
import { FormDebugPanelComponent } from './form-debug-panel/form-debug-panel.component';

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-card', component: CvcFormCardWrapper }],
};

@NgModule({
  declarations: [CvcFormCardWrapper, FormDebugPanelComponent],
  imports: [
    CommonModule,
    FormlyModule.forChild(wrapperConfig),

    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzTagModule,
    NzTabsModule,
    NzPopoverModule,

    CvcOrgSelectorBtnGroupModule,
    ...environment.devModules,
  ],
  exports: [CvcFormCardWrapper, FormDebugPanelComponent],
})
export class CvcFormCardWrapperModule {}
