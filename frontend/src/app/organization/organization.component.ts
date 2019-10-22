import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { Organization } from '../org-form/Organization';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass']
})
export class OrganizationComponent implements OnInit {
  assetAry: any = [];
  orgId: number;
  org: any;
  constructor(public activatedRoute: ActivatedRoute, public router: Router, public appService: AppService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assets }) => (this.assetAry = assets));
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['id'];
      this.appService.getOrganizationById(this.orgId).then((org) => (this.org = org));
    });
  }

  navigateToAssessment(id: number) {
    this.router.navigate([`assessment/${id}`]);
  }

  navigateToDashboard() {
    this.router.navigate([`dashboard`]);
  }

  navigateToCreateAsset(assetId: number) {
    this.router.navigate([`organization/${this.orgId}/asset-form`]);
  }

  navigateToAsset(assetId: number) {
    this.router.navigate([`organization/${this.orgId}/asset-form/${assetId}`]);
  }
}
