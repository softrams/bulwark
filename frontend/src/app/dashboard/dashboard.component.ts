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

  getOrganizations() {
    this.appService.getOrganizations().then((res) => {
      this.isArchive = false;
      this.orgAry = res;
    });
  }

  getArchivedOrganizations() {
    this.appService.getArchivedOrganizations().then((res) => {
      this.isArchive = true;
      this.orgAry = res;
    });
  }

  navigateToAsset(id: number) {
    this.router.navigate([`organization/${id}`]);
  }

  navigateToCreate() {
    this.router.navigate([`organization-form`]);
  }

  navigateToOrganization(id: number) {
    this.router.navigate([`organization-form/${id}`]);
  }

  archiveOrganization(org: Organization) {
    const confirmed = confirm(`Archive the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.archiveOrganization(org.id).subscribe((res) => {
        this.getOrganizations();
      });
    }
  }

  activateOrganization(org: Organization) {
    const confirmed = confirm(`Activate the organization "${org.name}"?`);
    if (confirmed) {
      this.appService.activateOrganization(org.id).subscribe((res) => {
        this.getOrganizations();
      });
    }
  }
}
