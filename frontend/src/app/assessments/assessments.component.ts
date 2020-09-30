import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { AlertService } from '../alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Assessment } from '../assessment-form/Assessment';
import { Table } from 'primeng/table';
import { UserService } from '../user.service';
import { User } from '../interfaces/User';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.sass'],
})
export class AssessmentsComponent implements OnInit {
  assessmentAry: any = [];
  assetId: number;
  orgId: number;
  testers: User[];
  @ViewChild('assessmentTable') table: Table;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    public alertService: AlertService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(
      ({ assessments }) => (this.assessmentAry = assessments)
    );
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = params.assetId;
      this.orgId = params.orgId;
    });
    this.userService.getUsers().subscribe((testers) => {
      this.testers = testers;
    });
  }

  /**
   * Function responsible for directing the user to the vulnerability details
   * @param id of vulnerability to load
   */
  navigateToVulnerability(id: number) {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${id}/vulnerability`,
    ]);
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
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment`,
    ]);
  }

  /**
   * Function responsible for directing the user to an assessment view with provided
   * ID
   * @param assessmentId is the ID associated to the assessment to load
   */
  navigateToAssessmentById(assessmentId: number) {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${assessmentId}`,
    ]);
  }

  /**
   * Delete assessment by ID
   * ID
   * @param assessmentId is the ID associated to the assessment to load
   */
  deleteAssessment(assessment: Assessment) {
    const r = confirm(`Delete the assessment "${assessment.name}"`);
    if (r === true) {
      this.appService
        .deleteAssessment(assessment.id)
        .subscribe((success: string) => {
          this.alertService.success(success);
          this.appService
            .getAssessments(this.orgId)
            .then((res) => (this.assessmentAry = res));
        });
    }
  }

  onTesterChange(event) {
    const selectedTesterAry = event.value.map((x) => x.id);
    this.table.filter(selectedTesterAry, 'testers', 'in');
  }

  onDateSelect(value, type) {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    if (type === 'startDate') {
      this.table.filter(date.toISOString(), 'startDate', 'equals');
    } else if (type === 'endDate') {
      this.table.filter(date.toISOString(), 'endDate', 'equals');
    }
  }
}
