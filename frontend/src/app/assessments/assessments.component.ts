import { Component, OnInit, ViewChild } from '@angular/core';
import { FilterService, FilterMatchMode } from 'primeng/api';
import { AppService } from '../app.service';
import { AlertService } from '../alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Assessment } from '../assessment-form/Assessment';
import { Table } from 'primeng/table';
import { User } from '../interfaces/User';
import { UserService } from '../user.service';

// User decorated with compound name field
interface FormattedUser extends User {
  name: string;
}

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.sass'],
})
export class AssessmentsComponent implements OnInit {
  assessmentAry: any = [];
  assetId: number;
  orgId: number;
  testers: FormattedUser[];
  readOnly: boolean;
  @ViewChild('assessmentTable') table: Table;

  cols = [
    {
      field: 'id',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'Assessment ID',
    },
    {
      field: 'name',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'Assessment Name',
    },
    {
      field: 'testers',
      filterMatchMode: 'arrayCompare',
      header: 'Testers',
    },
    {
      field: 'jiraId',
      filterMatchMode: FilterMatchMode.CONTAINS,
      header: 'Jira ID',
    },
    {
      field: 'startDate',
      filterMatchMode: FilterMatchMode.EQUALS,
      header: 'Start Date',
    },
    {
      field: 'startDate',
      filterMatchMode: FilterMatchMode.EQUALS,
      header: 'End Date',
    },
  ];

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    public alertService: AlertService,
    public userService: UserService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assessments }) => {
      this.readOnly = assessments.readOnly;
      this.assessmentAry = assessments.assessments;
    });
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = params.assetId;
      this.orgId = params.orgId;
    });
    this.userService.getUsers().subscribe((testers) => {
      // add a composite 'name' field to the Testers to display in MultiSelect
      this.testers = testers.map((tester) => ({
        ...tester,
        name: this.formatName(tester),
      }));
    });

    this.addArrayCompareTableFilter();
  }

  /**
   * Create custom table filter "matchMode" to compare multiselect filter array values to array of values in a table row field
   */
  private addArrayCompareTableFilter() {
    this.filterService.register(
      'arrayCompare',
      (values: User[], selections: FormattedUser[]): boolean => {
        return values.some((value) => {
          return !!selections.some(
            (selection) => selection.name === this.formatName(value)
          );
        });
      }
    );
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

  onDateSelect(value, type) {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    if (type === 'startDate') {
      this.table.filter(date.toISOString(), 'startDate', 'equals');
    } else if (type === 'endDate') {
      this.table.filter(date.toISOString(), 'endDate', 'equals');
    }
  }

  /**
   * Format composite name from first and last name fields
   */
  private formatName(user) {
    return `${user.firstName} ${user.lastName}`;
  }
}
