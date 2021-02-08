import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { ApiKey } from '../interfaces/ApiKey';

@Component({
  selector: 'app-apikey-management',
  templateUrl: './apikey-management.component.html',
  styleUrls: ['./apikey-management.component.sass'],
})
export class ApikeyManagementComponent implements OnInit {
  apiKeys: ApiKey[] = [];
  constructor(
    public authService: AuthService,
    public alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getActiveApiKeys();
  }

  getActiveApiKeys() {
    this.authService.getApiKeysInfo().subscribe((res: ApiKey[]) => {
      this.apiKeys = res;
    });
  }

  deactivateApiKey(id: number) {
    const r = confirm(
      'This API key may be in use by an external entity. Are you sure you want to delete it?'
    );
    if (r) {
      this.authService.adminDeactivateApiKey(id).subscribe((res: string) => {
        this.alertService.success(res);
        this.getActiveApiKeys();
      });
    }
  }
}
