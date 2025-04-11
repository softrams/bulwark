import { NgModule, Injectable } from '@angular/core';
import {
  Routes,
  RouterModule,
  Resolve,
  ActivatedRouteSnapshot,
} from '@angular/router';

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
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { InviteUserComponent } from './administration/invite-user/invite-user.component';
import { AdministrationComponent } from './administration/administration.component';
import { TeamFormComponent } from './team-form/team-form.component';
import { RegisterComponent } from './register/register.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserFormComponent } from './user-form/user-form.component';
import { SettingsComponent } from './administration/settings/settings.component';
import { EmailValidateComponent } from './email-validate/email-validate.component';
import { UserService } from './user.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { TeamService } from './team.service';
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
  constructor(
    private apiService: AppService,
    private userService: UserService
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    if (
      route.params.assetId &&
      route.params.assessmentId &&
      route.params.orgId
    ) {
      return forkJoin([
        this.apiService.getAssessment(
          route.params.assetId,
          route.params.assessmentId
        ),
        this.userService.getTesters(route.params.orgId),
      ]).pipe(
        map((result) => {
          return {
            assessment: result[0],
            testers: result[1],
          };
        })
      );
    } else {
      return this.userService.getTesters(route.params.orgId);
    }
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
export class TeamResolver implements Resolve<any> {
  constructor(private teamService: TeamService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.teamService.getTeamById(route.params.teamId);
  }
}
@Injectable()
export class TeamFormResolver implements Resolve<any> {
  constructor(
    private appService: AppService,
    private userService: UserService
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    return forkJoin([
      this.appService.getOrganizations(),
      this.userService.getAllUsers(),
    ]).pipe(
      map((result) => {
        return {
          organizations: result[0],
          activeUsers: result[1],
        };
      })
    );
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
@Injectable()
export class UserResolver implements Resolve<any> {
  constructor(private userService: UserService) {}

  resolve() {
    return this.userService.getUser();
  }
}
@Injectable()
export class SettingsResolver implements Resolve<any> {
  constructor(private apiService: AppService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.getConfig();
  }
}
const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'password-reset/:uuid',
    component: PasswordResetComponent,
  },
  {
    path: 'register/:uuid',
    component: RegisterComponent,
  },
  {
    path: 'email/validate/:uuid',
    component: EmailValidateComponent,
  },
  {
    path: 'user/profile',
    component: UserProfileComponent,
    resolve: { user: UserResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    resolve: { settings: SettingsResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'invite',
    component: InviteUserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'administration/team/:teamId',
    component: TeamFormComponent,
    canActivate: [AdminGuard],
    resolve: { result: TeamFormResolver },
  },
  {
    path: 'administration/team',
    component: TeamFormComponent,
    canActivate: [AdminGuard],
    resolve: { result: TeamFormResolver },
  },
  {
    path: 'administration/user/create',
    canActivate: [AdminGuard],
    component: UserFormComponent,
  },
  {
    path: 'administration/user/invite',
    component: InviteUserComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:orgId/asset/:assetId',
    component: AssessmentsComponent,
    resolve: { assessments: AssessmentsResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:orgId',
    component: OrganizationComponent,
    resolve: { assets: AssetsResolver },
    canActivate: [AuthGuard],
  },
  {
    path:
      'organization/:orgId/asset/:assetId/assessment/:assessmentId/vulnerability',
    component: VulnerabilityComponent,
    resolve: { vulnerabilities: VulnerabilitiesResolver },
    canActivate: [AuthGuard],
  },
  {
    path:
      'organization/:orgId/asset/:assetId/assessment/:assessmentId/vuln-form/:vulnId',
    component: VulnFormComponent,
    resolve: { vulnInfo: VulnerabilityResolver },
    canActivate: [AuthGuard],
  },
  {
    path:
      'organization/:orgId/asset/:assetId/assessment/:assessmentId/vuln-form',
    component: VulnFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organization-form',
    component: OrgFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organization-form/:id',
    component: OrgFormComponent,
    resolve: { organization: OrganizationResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:id/asset-form',
    component: AssetFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:id/asset-form/:assetId',
    component: AssetFormComponent,
    resolve: { asset: AssetResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment',
    component: AssessmentFormComponent,
    resolve: { result: AssessmentResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId',
    component: AssessmentFormComponent,
    resolve: { result: AssessmentResolver },
    canActivate: [AuthGuard],
  },
  {
    path: 'organization/:orgId/asset/:assetId/assessment/:assessmentId/report',
    component: ReportComponent,
    resolve: { report: ReportResolver },
    canActivate: [AuthGuard],
  },
  {
    path:
      'organization/:orgId/asset/:assetId/assessment/:assessmentId/report/puppeteer',
    component: ReportComponent,
    resolve: { report: ReportResolver },
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  exports: [RouterModule],
  providers: [
    AssetResolver,
    AssetsResolver,
    AssessmentsResolver,
    VulnerabilitiesResolver,
    OrganizationResolver,
    AssessmentResolver,
    VulnerabilityResolver,
    ReportResolver,
    UserResolver,
    SettingsResolver,
    TeamFormResolver,
    TeamResolver,
  ],
})
export class AppRoutingModule {}
