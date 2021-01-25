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
    let newUser: User;
    newUser.email = form.value.email;
    newUser.firstName = form.value.firstName;
    newUser.lastName = form.value.lastName;
    newUser.title = form.value.title;
    newUser.password = form.value.password;
    newUser.confirmPassword = form.value.newPassword;
    console.log(newUser);
    // this.userService.inviteUser(email).subscribe((res: string) => {
    //   this.alertService.success(res);
    // });
  }
}
