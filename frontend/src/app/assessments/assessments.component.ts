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
      this.assetId = params.assetId;
      this.orgId = params.orgId;
    });
  }

  /**
   * Function responsible for directing the user to the vulnerability details
   * @param id of vulnerability to load
   */
  navigateToVulnerability(id: number) {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment/${id}/vulnerability`]);
  }

  /**
   * Function responsible for directing the user back to the assessments view
   * passes organization id to fetch data
   */
  navigateToOrganization() {
    this.router.navigate([`organization/${this.orgId}`]);
  }

  /**
   * Function responsible for directing the user to the main Assessment view
   */
  navigateToAssessment() {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment`]);
  }

  /**
   * Function responsible for directing the user to an assessment view with provided
   * ID
   * @param assessmentId is the ID associated to the assessment to load
   */
  navigateToAssessmentById(assessmentId: number) {
    this.router.navigate([`organization/${this.orgId}/asset/${this.assetId}/assessment/${assessmentId}`]);
  }
}
