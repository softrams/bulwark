import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Organization } from '../org-form/Organization';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  orgAry: any = [];
  assetAry: any = [];
  orgId: number;
  isArchive = false;
  constructor(private appService: AppService, public activatedRoute: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.getOrganizations();
  }

  /**
   * Function responsible for retreving all organizational data
   * @memberof DashboardComponent
   */
  getOrganizations() {
    this.appService.getOrganizations().then((res) => {
      this.isArchive = false;
      this.orgAry = res;
    });
  }

  /**
   * Function responsible for checking the status of an organization
   * to determine if it is archived or not
   * @memberof DashboardComponent
   */
  getArchivedOrganizations() {
    this.appService.getArchivedOrganizations().then((res) => {
      this.isArchive = true;
      this.orgAry = res;
    });
  }

  /**
   * Function responsible for navigating to assests tied to an organization
   * @param {number} id is the ID of the organization tied to the assets
   * @memberof DashboardComponent
   */
  navigateToAsset(id: number) {
    this.router.navigate([`organization/${id}`]);
  }

  /**
   * Function responsible for navigating the user to the organization form to
   * either create or update an organization
   * @memberof DashboardComponent
   */
  navigateToCreate() {
    this.router.navigate([`organization-form`]);
  }

  /**
   * Function responsible for loading the organization the end user selects
   * @param {number} id is the associated ID of the organization requested
   * @memberof DashboardComponent
   */
  navigateToOrganization(id: number) {
    this.router.navigate([`organization-form/${id}`]);
  }

  /**
   * Function responsible for archiving an organization by
   * toggling the associated status
   * @param {Organization} org is the ID of the organization to alter
   * @memberof DashboardComponent
   */
  archiveOrganization(org: Organization) {
    const confirmed = confirm(`Archive the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.archiveOrganization(org.id).subscribe((res) => {
        this.getOrganizations();
      });
    }
  }

  /**
   * Function responsible for altering an organization status back
   * to active
   * @param {Organization} org is the ID of the organization to alter
   * @memberof DashboardComponent
   */
  activateOrganization(org: Organization) {
    const confirmed = confirm(`Activate the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.activateOrganization(org.id).subscribe((res) => {
        this.getOrganizations();
      });
    }
  }
}
