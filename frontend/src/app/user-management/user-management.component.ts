import { Component, OnInit, ViewChild } from '@angular/core';
import { FilterMatchMode } from 'primeng/api';
import { Table } from 'primeng/table';
import { User } from '../interfaces/User';
import { UserService } from '../user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.sass'],
})
export class UserManagementComponent implements OnInit {
  users: User[];
  userForm: FormGroup;
  constructor(
    public userService: UserService,
    private fb: FormBuilder,
    public alertService: AlertService
  ) {}
  @ViewChild('userTable') table: Table;

  cols = [
    {
      field: 'id',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'User ID',
    },
    {
      field: 'firstName',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'First Name',
    },
    {
      field: 'lastName',
      filterMatchMode: 'arrayCompare',
      header: 'Last Name',
    },
    {
      field: 'title',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'title',
    },
    {
      field: 'active',
      filterMatchMode: FilterMatchMode.EQUALS,
      header: 'Status',
    },
  ];

  ngOnInit(): void {
    this.createForm();
    this.getUsers();
  }

  getUsers() {
    this.userService
      .getAllUsers()
      .subscribe((fetchedUsers) => (this.users = fetchedUsers));
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
      this.getUsers();
    });
  }
}
