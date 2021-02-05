import { Component, OnInit } from '@angular/core';
import { FilterMatchMode } from 'primeng/api';
import { Table } from 'primeng/table';
import { User } from '../interfaces/User';
import { UserService } from '../user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../alert/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.sass'],
})
export class UserFormComponent implements OnInit {
  users: User[];
  userForm: FormGroup;
  constructor(
    public userService: UserService,
    private fb: FormBuilder,
    public alertService: AlertService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      title: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit(form) {
    const user: User = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      title: form.value.title,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
      email: form.value.email,
    };
    this.userService.createUser(user).subscribe((res: string) => {
      this.alertService.success(res);
      this.router.navigate(['administration']);
    });
  }
}
