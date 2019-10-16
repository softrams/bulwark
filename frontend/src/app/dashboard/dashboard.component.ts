import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Params } from '@angular/router';

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
    private appService: AppService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.activatedRoute.snapshot.params.id) {
      this.orgId = +this.activatedRoute.snapshot.params.id;
      this.appService.getOrganizationAssets(this.orgId).then(res => {
        this.assetAry = res;
      });
    } else {
      this.appService.getOrganizations().then(res => {
        this.orgAry = res;
      });
    }
  }
}
