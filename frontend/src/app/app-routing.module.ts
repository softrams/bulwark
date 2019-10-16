import { NgModule, Injectable } from '@angular/core';
import {
  Routes,
  RouterModule,
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';

import { DashboardComponent } from '../app/dashboard/dashboard.component';

import { AppService } from '../app/app.service';
import { OrganizationComponent } from './organization/organization.component';

@Injectable()
export class AssetResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getOrganizationAssets(route.params.id);
  }
}

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'organization/:id',
    component: OrganizationComponent,
    resolve: { assets: AssetResolver }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AssetResolver]
})
export class AppRoutingModule {}
