import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  orgAry: any = [];
  assetAry: any = [];
  orgId: number;
  constructor(
    private sanitizer: DomSanitizer,
    private appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.appService.getOrganizations().then((res) => {
      this.orgAry = res;
    });
  }

  public getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  navigateToAsset(id: number) {
    this.router.navigate([`organization/${id}`]);
  }

  navigateToCreate() {
    this.router.navigate([`organization-form`]);
  }
}
