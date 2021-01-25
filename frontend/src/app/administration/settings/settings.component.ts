import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../alert/alert.service';
import { Settings } from '../../interfaces/Settings';
import { UserService } from '../../user.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass'],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isEdit = false;
  settings: Settings;
  public keyPlaceholder = '************************';
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public alertService: AlertService,
    public activatedRoute: ActivatedRoute,
    public userService: UserService,
    public appService: AppService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ settings }) => {
      this.createForm();
      this.settings = settings;
      this.rebuildForm();
    });
  }

  createForm() {
    this.settingsForm = this.fb.group({
      fromEmail: [{ value: '', disabled: !this.isEdit }],
      fromEmailPassword: [{ value: '', disabled: !this.isEdit }],
      companyName: [{ value: '', disabled: !this.isEdit }],
    });
  }

  rebuildForm() {
    this.settingsForm.reset({
      fromEmail: this.settings?.fromEmail,
      fromEmailPassword: this.settings?.fromEmailPassword,
      companyName: this.settings?.companyName,
    });
  }

  onSubmit(form: FormGroup) {
    if (!this.isEdit) {
      this.isEdit = true;
      this.settingsForm.enable();
    } else {
      const settingsInfo = form.value;
      this.appService.updateConfig(settingsInfo).subscribe((res: string) => {
        this.alertService.success(res);
        this.isEdit = false;
        this.settingsForm.disable();
      });
    }
  }
}
