import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
})
export class RegisterComponent implements OnInit {
  uuid: string;
  registerForm: FormGroup;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public userService: UserService,
    public router: Router,
    public alertService: AlertService
  ) {
    this.uuid = this.activatedRoute.snapshot.paramMap.get('uuid');
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.registerForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(form) {
    const registerObj = {
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
      uuid: this.uuid,
    };
    this.userService.registerUser(registerObj).subscribe((res: string) => {
      this.router.navigate(['login']);
      this.alertService.success(res);
    });
  }
}
