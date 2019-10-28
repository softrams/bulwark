import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { DashboardComponent } from '../app/dashboard/dashboard.component';
import { AssessmentsComponent } from '../app/assessments/assessments.component';

import { AppService } from '../app/app.service';
import { OrganizationComponent } from './organization/organization.component';
import { VulnerabilityComponent } from './vulnerability/vulnerability.component';
import { VulnFormComponent } from './vuln-form/vuln-form.component';
import { OrgFormComponent } from './org-form/org-form.component';
import { AssetFormComponent } from './asset-form/asset-form.component';
import { AssessmentFormComponent } from './assessment-form/assessment-form.component';
import { ReportComponent } from './report/report.component';
@Injectable()
export class AssetsResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getOrganizationAssets(route.params.orgId);
  }
}

@Injectable()
export class AssetResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getAsset(route.params.assetId, route.params.id);
  }
}

@Injectable()
export class AssessmentResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getAssessment(route.params.assetId, route.params.assessmentId);
  }
}

@Injectable()
export class AssessmentsResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getAssessments(route.params.assetId);
  }
}

@Injectable()
export class VulnerabilitiesResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getVulnerabilities(route.params.assessmentId);
  }
}

@Injectable()
export class VulnerabilityResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getVulnerability(route.params.vulnId);
  }
}

@Injectable()
export class OrganizationResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getOrganizationById(route.params.id);
  }
}

@Injectable()
export class ReportResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getReport(route.params.assessmentId);
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
    path: 'organization/:orgId/asset/:assetId',
    component: AssessmentsComponent,
    resolve: { assessments: AssessmentsResolver }
  },
  {
    path: 'organization/:orgId',
    component: OrganizationComponent,
    resolve: { assets: AssetsResolver }
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId/vulnerability',
    component: VulnerabilityComponent,
    resolve: { vulnerabilities: VulnerabilitiesResolver }
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId/vuln-form/:vulnId',
    component: VulnFormComponent,
    resolve: { vulnerability: VulnerabilityResolver }
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId/vuln-form',
    component: VulnFormComponent
  },
  {
    path: 'organization-form',
    component: OrgFormComponent
  },
  {
    path: 'organization-form/:id',
    component: OrgFormComponent,
    resolve: { organization: OrganizationResolver }
  },
  {
    path: 'organization/:id/asset-form',
    component: AssetFormComponent
  },
  {
    path: 'organization/:id/asset-form/:assetId',
    component: AssetFormComponent,
    resolve: { asset: AssetResolver }
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment',
    component: AssessmentFormComponent
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId',
    component: AssessmentFormComponent,
    resolve: { assessment: AssessmentResolver }
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId/report',
    component: ReportComponent,
    resolve: { report: ReportResolver }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AssetResolver,
    AssetsResolver,
    AssessmentsResolver,
    VulnerabilitiesResolver,
    OrganizationResolver,
    AssessmentResolver,
    VulnerabilityResolver,
    ReportResolver
  ]
})
export class AppRoutingModule {}
