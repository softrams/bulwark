import { Component, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppService } from '../app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assessment } from './Assessment';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-assessment-form',
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.sass']
})
export class AssessmentFormComponent implements OnInit, OnChanges {
  public assessmentModel: Assessment;
  public assessmentForm: FormGroup;
  public assetId: number;
  public assessmentId: number;
  public orgId: number;
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
    this.activatedRoute.data.subscribe(({ assessment }) => {
      if (assessment) {
        assessment.startDate = this.transformDate(assessment.startDate);
        assessment.endDate = this.transformDate(assessment.endDate);
        this.assessmentForm.patchValue(assessment);
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = +params['assetId'];
      this.assessmentId = +params['assessmentId'];
      this.orgId = +params['orgId'];
    });
  }

  /**
   * Function responsible to detect changes for the form and rebuild it
   * @memberof AssessmentFormComponent
   */
  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function responsible for formatting the date data in the form for
   * storage
   * @param {string} date is the date data from the form
   * @returns formatted date to be stored
   * @memberof AssessmentFormComponent
   */
  transformDate(date: string) {
    return date.substring(0, 10);
  }

  /**
   * Function responsible for rebuilding the reactive form in Angular
   * @memberof AssessmentFormComponent
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
      endDate: this.assessmentModel.endDate
    });
  }

  /**
   * Function responsible for creating the reactive form in Angular
   * @memberof AssessmentFormComponent
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
      endDate: ['', [Validators.required]]
    });
  }

  /**
   * Function responsible for handling the form submission and triggers a call
   * to the createOrUpdateAssessment() function
   * @param {FormGroup} assessment
   * @memberof AssessmentFormComponent
   */
  onSubmit(assessment: FormGroup) {
    this.assessmentModel = assessment.value;
    this.assessmentModel.asset = this.assetId;
    this.createOrUpdateAssessment(this.assessmentModel);
  }

  /**
   * Function responsible for handling the form data and creating or updating
   * an Assessment
   * @param {Assessment} assessment form object data passed from OnSubmit()
   * @memberof AssessmentFormComponent
   */
  createOrUpdateAssessment(assessment: Assessment) {
    if (this.assessmentId) {
      this.appService.updateAssessment(assessment, this.assessmentId, this.assetId).subscribe((res: string) => {
        this.navigateToAssessments();
        this.alertService.success(res);
      });
    } else {
      this.appService.createAssessment(this.assessmentModel).subscribe((res: string) => {
        this.navigateToAssessments();
        this.alertService.success(res);
      });
    }
  }

  /**
   * Function responsible for navigating the user back to the Assessments View
   * @memberof AssessmentFormComponent
   */
  navigateToAssessments() {
    this.route.navigate([`organization/${this.orgId}/asset/${this.assetId}`]);
  }
}
