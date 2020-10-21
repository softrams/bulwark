import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertModule } from './alert/alert.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppService } from './app.service';
import { LoaderService } from './loader.service';
import { AuthGuard } from './auth.guard';
import { AppInterceptor } from './app.interceptor';
import { HttpClientModule } from '@angular/common/http';
import { AssessmentsComponent } from './assessments/assessments.component';
import { OrganizationComponent } from './organization/organization.component';
import { VulnerabilityComponent } from './vulnerability/vulnerability.component';
import { VulnFormComponent } from './vuln-form/vuln-form.component';
import { OrgFormComponent } from './org-form/org-form.component';
import { AssetFormComponent } from './asset-form/asset-form.component';
import { FooterComponent } from './footer/footer.component';
import { AssessmentFormComponent } from './assessment-form/assessment-form.component';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe } from '@angular/common';
import { ReportComponent } from './report/report.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { RegisterComponent } from './register/register.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {ButtonModule} from 'primeng/button';
import { EmailValidateComponent } from './email-validate/email-validate.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    OrganizationComponent,
    AssessmentsComponent,
    VulnerabilityComponent,
    OrgFormComponent,
    AssetFormComponent,
    VulnFormComponent,
    FooterComponent,
    AssessmentFormComponent,
    ReportComponent,
    PageNotFoundComponent,
    LoginComponent,
    ForgotPasswordComponent,
    PasswordResetComponent,
    InviteUserComponent,
    RegisterComponent,
    UserProfileComponent,
    SettingsComponent,
    EmailValidateComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MarkdownModule.forRoot(),
    AlertModule,
    NgSelectModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    CalendarModule,
    ProgressSpinnerModule,
    ButtonModule
  ],
  providers: [
    AppService,
    DatePipe,
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
