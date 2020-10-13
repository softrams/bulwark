import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-email-validate',
  templateUrl: './email-validate.component.html',
  styleUrls: ['./email-validate.component.sass'],
})
export class EmailValidateComponent implements OnInit {
  uuid: string;
  emailUpdateForm: FormGroup;
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
    this.emailUpdateForm = this.fb.group({
      password: ['', Validators.required],
    });
  }

  onSubmit(form) {
    this.authService
      .validateUserEmailRequest(form.value.password, this.uuid)
      .subscribe((res: string) => {
        this.router.navigate(['login']);
        this.alertService.success(res);
      });
  }
}
