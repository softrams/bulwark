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
  isEdit = false;
  user: User;
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public alertService: AlertService,
    public activatedRoute: ActivatedRoute,
    public userService: UserService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ user }) => {
      if (user) {
        this.user = user;
        this.rebuildForm();
      }
    });
  }

  createForm() {
    this.userForm = this.fb.group({
      firstName: [{ value: '', disabled: !this.isEdit }, Validators.required],
      lastName: [{ value: '', disabled: !this.isEdit }, Validators.required],
      title: [{ value: '', disabled: !this.isEdit }, Validators.required],
    });
  }

  rebuildForm() {
    this.userForm.reset({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      title: this.user.title,
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
}
