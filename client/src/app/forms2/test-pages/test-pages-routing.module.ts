import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NonstateFormPage } from './nonstate-form/nonstate-form.page'
import { TestPagesView } from './test-pages.view'

const routes: Routes = [
  {
    path: '',
    component: TestPagesView,
    children: [
      { path: '', redirectTo: 'nonstate-form', pathMatch: 'full' },
      {
        path: 'nonstate-form',
        component: NonstateFormPage,
        data: {
          breadcrumb: 'Fields Test',
        },
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestPagesRoutingModule {}
