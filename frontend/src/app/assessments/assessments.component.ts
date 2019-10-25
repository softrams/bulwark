import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faHaykal } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.sass']
})
export class AssessmentsComponent implements OnInit {
  assessmentAry: any = [];
  assetId: number;
  orgId: number;
  faPencilAlt = faPencilAlt;
  faHaykal = faHaykal;

  constructor(public activatedRoute: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assessments }) => (this.assessmentAry = assessments));
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = params['assetId'];
      this.orgId = params['orgId'];
    });
  }

  navigateToVulnerability(id: number) {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment/${id}/vulnerability`]);
  }

  navigateToOrganization() {
    this.router.navigate([`organization/${this.orgId}`]);
  }

  navigateToAssessment() {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment`]);
  }

  navigateToAssessmentById(assessmentId: number) {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment/${assessmentId}`]);
  }
}
