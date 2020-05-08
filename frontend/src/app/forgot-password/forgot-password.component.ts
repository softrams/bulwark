import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.sass'],
})
export class ForgotPasswordComponent implements OnInit {
  pwdResetForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public alertService: AlertService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.pwdResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(form) {
    const email = { email: form.value.email };
    this.authService.forgotPassword(email).subscribe((res: string) => {
      this.alertService.success(res);
      this.pwdResetForm.reset();
    });
  }
}
