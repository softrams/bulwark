import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import {
  faPencilAlt,
  faList,
  faBox,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Asset } from '../asset-form/Asset';
import { AlertService } from '../alert/alert.service';
@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass'],
})
export class OrganizationComponent implements OnInit {
  assetAry: any = [];
  orgId: number;
  org: any;
  isArchive = false;
  faPencilAlt = faPencilAlt;
  faList = faList;
  faBox = faBox;
  faBoxOpen = faBoxOpen;
  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    public alertService: AlertService
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(
      ({ assets }) => (this.assetAry = assets)
    );
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params.orgId;
      this.appService
        .getOrganizationById(this.orgId)
        .then((org) => (this.org = org));
    });
  }
  /**
   * Function responsible retrieving active assets
   */
  getActiveAssets() {
    this.appService.getOrganizationAssets(this.orgId).then((activeAssets) => {
      this.assetAry = activeAssets;
      this.isArchive = false;
    });
  }
  /**
   * Function responsible retrieving archived assets
   */
  getArchivedAssets() {
    this.appService
      .getOrganizationArchiveAssets(this.orgId)
      .subscribe((archivedAssets) => {
        this.assetAry = archivedAssets;
        this.isArchive = true;
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

  /**
   * Function responsible for archiving an asset
   */
  archiveAsset(asset: Asset) {
    const confirmed = confirm(`Archive the asset "${asset.name}"?`);
    if (confirmed) {
      this.appService.archiveAsset(asset).subscribe((res: string) => {
        this.alertService.success(res);
        this.getActiveAssets();
      });
    }
  }
  /**
   * Function responsible for activating an asset
   */
  activateAsset(asset: Asset) {
    const confirmed = confirm(`Activate the asset "${asset.name}"?`);
    if (confirmed) {
      this.appService.activateAsset(asset).subscribe((res: string) => {
        this.alertService.success(res);
        this.getArchivedAssets();
      });
    }
  }
}
