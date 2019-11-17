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
      this.orgId = params.orgId;
      this.appService.getOrganizationById(this.orgId).then((org) => (this.org = org));
    });
  }

  /**
   * Function responsible for navigating the user to an Assessment
   * @param id assessment ID is required
   */
  navigateToAssessment(id: number) {
    this.router.navigate([`organization/${this.orgId}/asset/${id}`]);
  }

  /**
   * Function responsible for navigating the user back to the main dashboard
   */
  navigateToDashboard() {
    this.router.navigate([`dashboard`]);
  }

  /**
   * Function responsible for navigating the user to the assessment area to create
   * a new assessment
   */
  navigateToCreateAsset() {
    this.router.navigate([`organization/${this.orgId}/asset-form`]);
  }

  /**
   * Function responsible for navigating the user to Asset Area
   * @param assetId asset ID passed required
   */
  navigateToAsset(assetId: number) {
    this.router.navigate([`organization/${this.orgId}/asset-form/${assetId}`]);
  }
}
