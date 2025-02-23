import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { CvcFormlyConfig } from '@app/forms/forms.config'
import { LetDirective, PushPipe } from '@ngrx/component'
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LetDirective,
    PushPipe,
    FormlyModule.forRoot(CvcFormlyConfig),
    FormlyNgZorroAntdModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyNgZorroAntdModule,
  ],
})
export class CvcFormsModule {}
