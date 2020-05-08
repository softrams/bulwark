import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.sass'],
})
export class PasswordResetComponent implements OnInit {
  uuid: string;
  pwdResetForm: FormGroup;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public alertService: AlertService
  ) {
    this.uuid = this.activatedRoute.snapshot.paramMap.get('uuid');
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.pwdResetForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(form) {
    const pwdUpdateObj = {
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
      uuid: this.uuid,
    };
    this.authService.passwordReset(pwdUpdateObj).subscribe((res: string) => {
      this.alertService.success(res);
      this.router.navigate(['login']);
    });
  }
}
