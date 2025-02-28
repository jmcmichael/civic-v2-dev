import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { GenesReviseView } from './genes-revise.view'
import { GenesSuggestModule } from './genes-suggest/genes-suggest.module'
import { GenesSuggestPage } from './genes-suggest/genes-suggest.page'

const routes: Routes = [
  {
    path: '',
    component: GenesReviseView,
    data: { breadcrumb: 'Revise' },
    children: [
      { path: '', redirectTo: 'suggest', pathMatch: 'full' },
      {
        path: 'suggest',
        component: GenesSuggestPage,
        data: {
          breadcrumb: 'Suggest Revision',
        },
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes), GenesSuggestModule],
})
export class GenesReviseRoutingModule {}
