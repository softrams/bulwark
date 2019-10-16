import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    public activatedRoute: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.appService.getOrganizations().then(res => {
      this.orgAry = res;
    });
  }

  navigateToAsset(id: number) {
    this.router.navigate([`organization/${id}`]);
  }
}
