import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass']
})
export class OrganizationComponent implements OnInit {
  assetAry: any = [];

  constructor(public activatedRoute: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assets }) => (this.assetAry = assets));
  }

  navigateToAssessment(id: number) {
    this.router.navigate([`assessment/${id}`]);
  }

  navigateToCreateAsset() {
    this.router.navigate([`asset-form`]);
  }

}
