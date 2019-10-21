import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.sass']
})
export class AssessmentsComponent implements OnInit {
  assessmentAry: any = [];
  assetId: number;

  constructor(private appService: AppService, public activatedRoute: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assessments }) => (this.assessmentAry = assessments));
  }

  navigateToVulnerability(id: number) {
    this.router.navigate([`vulnerability/${id}`]);
  }

  navigateToDashboard() {
    this.router.navigate([`dashboard`]);
  }
}
