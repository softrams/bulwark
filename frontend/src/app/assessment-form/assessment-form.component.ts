import { Component, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppService } from '../app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assessment } from './Assessment';
import { AlertService } from '../alert/alert.service';
import { User } from '../interfaces/User';

@Component({
  selector: 'app-assessment-form',
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.sass'],
})
export class AssessmentFormComponent implements OnInit, OnChanges {
  public assessmentModel: Assessment;
  public assessmentForm: FormGroup;
  public assetId: number;
  public assessmentId: number;
  public orgId: number;
  public testers: User[] = [];
  constructor(
    public appService: AppService,
    private fb: FormBuilder,
    public route: Router,
    public activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ result }) => {
      if (result.assessment) {
        result.assessment.startDate = this.transformDate(
          result.assessment.startDate
        );
        result.assessment.endDate = this.transformDate(
          result.assessment.endDate
        );
        this.testers = result.testers;
        this.assessmentForm.patchValue(result.assessment);
      } else {
        this.testers = result;
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = +params.assetId;
      this.assessmentId = +params.assessmentId;
      this.orgId = +params.orgId;
    });
  }

  /**
   * Function responsible to detect changes for the form and rebuild it
   */
  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function responsible for formatting the date data in the form for
   * storage
   * @param date is the date data from the form
   * @returns formatted date to be stored
   */
  transformDate(date: string) {
    return date.substring(0, 10);
  }

  /**
   * Function responsible for rebuilding the reactive form in Angular
   */
  rebuildForm() {
    this.assessmentForm.reset({
      name: this.assessmentModel.name,
      executiveSummary: this.assessmentModel.executiveSummary,
      jiraId: this.assessmentModel.jiraId,
      testUrl: this.assessmentModel.testUrl,
      prodUrl: this.assessmentModel.prodUrl,
      scope: this.assessmentModel.scope,
      tag: this.assessmentModel.tag,
      startDate: this.assessmentModel.startDate,
      endDate: this.assessmentModel.endDate,
      testers: this.assessmentModel.testers,
    });
  }

  /**
   * Function responsible for creating the reactive form in Angular
   */
  createForm() {
    this.assessmentForm = this.fb.group({
      name: ['', [Validators.required]],
      executiveSummary: ['', Validators.maxLength(4000)],
      jiraId: ['', []],
      testUrl: ['', [Validators.required]],
      prodUrl: ['', [Validators.required]],
      scope: ['', [Validators.required]],
      tag: ['', []],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      testers: ['', [Validators.required]],
    });
  }

  /**
   * Function responsible for handling the form submission and triggers a call
   * to the createOrUpdateAssessment() function
   */
  onSubmit(assessment: FormGroup) {
    this.assessmentModel = assessment.value;
    this.createOrUpdateAssessment(this.assessmentModel);
  }

  /**
   * Function responsible for handling the form data and creating or updating
   * an Assessment
   * @param assessment form object data passed from OnSubmit()
   */
  createOrUpdateAssessment(assessment: Assessment) {
    if (this.assessmentId) {
      this.appService
        .updateAssessment(assessment, this.assessmentId, this.assetId)
        .subscribe((res: string) => {
          this.navigateToAssessments();
          this.alertService.success(res);
        });
    } else {
      this.assessmentModel.asset = this.assetId;
      this.appService
        .createAssessment(this.assessmentModel)
        .subscribe((res: string) => {
          this.navigateToAssessments();
          this.alertService.success(res);
        });
    }
  }

  /**
   * Function responsible for navigating the user back to the Assessments View
   */
  navigateToAssessments() {
    this.route.navigate([`organization/${this.orgId}/asset/${this.assetId}`]);
  }
}
