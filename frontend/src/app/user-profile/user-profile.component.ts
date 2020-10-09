import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';
import { User } from '../interfaces/User';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  securityForm: FormGroup;
  emailForm: FormGroup;
  isEdit = false;
  isSecurityEdit = false;
  isEmailEdit = false;
  user: User;
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public alertService: AlertService,
    public activatedRoute: ActivatedRoute,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ user }) => {
      this.createForms();
      this.user = user;
      this.rebuildForm();
      this.rebuildSecurityForm();
      this.rebuildEmailForm();
    });
  }

  createForms() {
    this.userForm = this.fb.group({
      firstName: [{ value: '', disabled: !this.isEdit }, Validators.required],
      lastName: [{ value: '', disabled: !this.isEdit }, Validators.required],
      title: [{ value: '', disabled: !this.isEdit }, Validators.required],
    });
    this.securityForm = this.fb.group({
      oldPassword: [
        { value: '', disabled: !this.isSecurityEdit },
        Validators.required,
      ],
      newPassword: [
        { value: '', disabled: !this.isSecurityEdit },
        Validators.required,
      ],
      confirmNewPassword: [
        { value: '', disabled: !this.isSecurityEdit },
        Validators.required,
      ],
    });
    this.emailForm = this.fb.group({
      email: [
        { value: '', disabled: !this.isEmailEdit },
        [Validators.required, Validators.email],
      ],
      newEmail: [
        { value: '', disabled: !this.isEmailEdit },
        [Validators.required, Validators.email],
      ],
    });
  }

  rebuildForm() {
    this.userForm.reset({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      title: this.user.title,
    });
  }

  rebuildSecurityForm() {
    this.securityForm.reset({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }

  rebuildEmailForm() {
    this.emailForm.reset({
      email: this.user.email,
      newEmail: '',
    });
  }
  onSubmit(form: FormGroup) {
    if (!this.isEdit) {
      this.isEdit = true;
      this.userForm.enable();
    } else {
      const userInfo: User = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        title: form.value.title,
      };
      this.userService.patchUser(userInfo).subscribe((res: string) => {
        this.alertService.success(res);
        this.isEdit = false;
        this.userForm.disable();
      });
    }
  }

  onSecuritySubmit(form: FormGroup) {
    if (!this.isSecurityEdit) {
      this.isSecurityEdit = true;
      this.securityForm.enable();
    } else {
      this.authService
        .updatePassword(
          form.value.oldPassword,
          form.value.newPassword,
          form.value.confirmNewPassword
        )
        .subscribe((res: string) => {
          this.alertService.success(res);
          this.isSecurityEdit = false;
          this.securityForm.disable();
          this.securityForm.reset();
        });
    }
  }

  onEmailFormSubmit(form: FormGroup) {
    if (!this.isEmailEdit) {
      this.isEmailEdit = true;
      this.emailForm.reset();
      this.emailForm.enable();
    } else {
      this.authService
        .updateUserEmail(form.value.email, form.value.newEmail)
        .subscribe((res: string) => {
          this.alertService.success(res);
          this.isEmailEdit = false;
          this.emailForm.disable();
          this.rebuildEmailForm();
        });
    }
  }

  revokeUpdateEmailRequest() {
    this.user.newEmail = '';
    this.authService.revokeUserEmail().subscribe((res: string) => {
      this.alertService.success(res);
      this.isEmailEdit = false;
      this.emailForm.disable();
      this.rebuildEmailForm();
    });
  }
}
