import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../interfaces/User';
import { UserService } from '../user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../alert/alert.service';
import { Router } from '@angular/router';

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
    public alertService: AlertService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService
      .getAllUsers()
      .subscribe((fetchedUsers) => (this.users = fetchedUsers));
  }

  navigateToTeamCreateUser() {
    this.router.navigate(['administration/user/create']);
  }

  navigateToTeamInviteUser() {
    this.router.navigate(['administration/user/invite']);
  }
  /**
   * Activate the given user
   * @param user User to activate
   */
  activateUser(user: User) {
    this.userService.activateUser(user.id).subscribe(
      (message) => {
        this.alertService.success(message as string);
        this.getUsers();
      },
      (error) => {
        this.alertService.error(error);
      }
    );
  }
  /**
   * Deactivate the given user
   * @param user User to deactivate
   */
  deactivateUser(user: User) {
    this.userService.deactivateUser(user.id).subscribe(
      (message) => {
        this.alertService.success(message as string);
        this.getUsers();
      },
      (error) => {
        this.alertService.error(error);
      }
    );
  }
}
