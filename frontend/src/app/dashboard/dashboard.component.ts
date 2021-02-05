import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Organization } from '../org-form/Organization';
import { AlertService } from '../alert/alert.service';
import { Table } from 'primeng/table';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent implements OnInit {
  orgAry: any = [];
  assetAry: any = [];
  orgId: number;
  isArchive = false;
  isAdmin: boolean;
  @ViewChild('orgTable') table: Table;
  constructor(
    private appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    private alertService: AlertService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.getOrganizations();
  }

  /**
   * Function responsible for retreving all organizational data
   */
  getOrganizations() {
    this.appService.getOrganizations().then((res) => {
      this.isArchive = false;
      this.orgAry = res;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  /**
   * Function responsible for checking the status of an organization
   * to determine if it is archived or not
   */
  getArchivedOrganizations() {
    this.appService.getArchivedOrganizations().then((res) => {
      this.isArchive = true;
      this.orgAry = res;
    });
  }

  /**
   * Function responsible for navigating to assests tied to an organization
   * @param id is the ID of the organization tied to the assets
   */
  navigateToAsset(id: number) {
    this.router.navigate([`organization/${id}`]);
  }

  /**
   * Function responsible for navigating the user to the organization form to
   * either create or update an organization
   */
  navigateToCreate() {
    this.router.navigate([`organization-form`]);
  }

  /**
   * Function responsible for loading the organization the end user selects
   * @param id is the associated ID of the organization requested
   */
  navigateToOrganization(id: number) {
    this.router.navigate([`organization-form/${id}`]);
  }

  /**
   * Function responsible for archiving an organization by
   * toggling the associated status
   * @param org is the ID of the organization to alter
   */
  archiveOrganization(org: Organization) {
    const confirmed = confirm(`Archive the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.archiveOrganization(org.id).subscribe((res: string) => {
        this.getOrganizations();
        this.alertService.success(res);
      });
    }
  }

  /**
   * Function responsible for altering an organization status back
   * to active
   * @param org is the ID of the organization to alter
   */
  activateOrganization(org: Organization) {
    const confirmed = confirm(`Activate the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.activateOrganization(org.id).subscribe((res: string) => {
        this.getOrganizations();
        this.alertService.success(res);
      });
    }
  }
}
