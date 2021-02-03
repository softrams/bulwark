import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.sass'],
})
export class InviteUserComponent implements OnInit {
  inviteForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    public router: Router,
    public alertService: AlertService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(form) {
    const email = { email: form.value.email };
    this.userService.inviteUser(email).subscribe((res: string) => {
      this.router.navigate(['administration']);
      this.alertService.success(res);
    });
  }
}
