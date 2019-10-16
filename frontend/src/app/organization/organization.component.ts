import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.sass']
})
export class OrganizationComponent implements OnInit {
  assetAry: any = [];

  constructor(public activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(
      ({ assets }) => (this.assetAry = assets)
    );
  }
}
