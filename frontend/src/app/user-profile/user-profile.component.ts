import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
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
    this.userForm = this.fb.group({
      firstName: [{ value: '', disabled: !this.isEdit }, Validators.required],
      lastName: [{ value: '', disabled: !this.isEdit }, Validators.required],
    });
  }

  onSubmit(form: FormGroup) {
    if (!this.isEdit) {
      this.isEdit = true;
      this.userForm.enable();
    }
  }
}
