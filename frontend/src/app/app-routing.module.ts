import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from '../app/dashboard/dashboard.component';
import { AssessmentsComponent } from '../app/assessments/assessments.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/organization',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/organization',
    component: DashboardComponent
  },
  {
    path: 'dashboard/organization/:id',
    component: DashboardComponent
  },
  {
    path: 'dashboard/organization/asset/assessment/',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
