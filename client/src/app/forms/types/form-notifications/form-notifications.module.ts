import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { CvcFormNotificationsComponent } from './form-notifications.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'cvc-form-notifications',
      component: CvcFormNotificationsComponent,
    },
  ],
}

@NgModule({
  imports: [
    CommonModule,
    CvcFormNotificationsComponent,
    FormlyModule.forChild(typeConfig),
  ],
  exports: [CvcFormNotificationsComponent],
})
export class CvcFormNotificationsModule {}
