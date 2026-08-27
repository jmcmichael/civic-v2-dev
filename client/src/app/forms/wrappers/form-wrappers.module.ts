import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcFormCardModule } from './form-card/form-card.module'
import { CvcFormFieldWrapperModule } from './form-field/form-field.module'
import { CvcFormFooterWrapperModule } from './form-footer/form-footer.wrapper.module'
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module'
import { CvcFormRowWrapperModule } from './form-row/form-row.module'
import { CvcGridWrappersModule } from './grid/grid.wrappers.module'
import { CvcQuerySubfiltersCardModule } from '@app/forms/wrappers/query-subfilters-card/query-subfilters-card.module'
import { CvcQueryBuilderCardModule } from '@app/forms/wrappers/query-builder-card/query-builder-card.module'
import { CvcQueryStructCardModule } from './query-struct-card/query-struct-card.module'

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
    CvcFormCardModule,
    CvcFormFooterWrapperModule,
    CvcFormFieldWrapperModule,
    CvcFormRowWrapperModule,
    CvcGridWrappersModule,
    CvcQuerySubfiltersCardModule,
    CvcQueryBuilderCardModule,
    CvcQueryStructCardModule,
  ],
})
export class CvcFormWrappersModule {}
