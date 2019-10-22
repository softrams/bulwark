import { Component, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppService } from '../app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assessment } from './Assessment';
import { DatePipe } from '@angular/common';

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
    private datePipe: DatePipe
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ assessment }) => {
      assessment.startDate = this.transformDate(assessment.startDate);
      assessment.endDate = this.transformDate(assessment.endDate);
      this.assessmentForm.patchValue(assessment);
    });
    this.activatedRoute.params.subscribe((params) => {
      this.assetId = params['assetId'];
      this.orgId = params['assetId'];
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  transformDate(date) {
    return new Date(date);
  }

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

  createForm() {
    this.assessmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]],
      executiveSummary: ['', [Validators.required, Validators.maxLength(1500)]],
      jiraId: ['', [Validators.required, Validators.maxLength(15)]],
      testUrl: ['', [Validators.required, Validators.maxLength(250)]],
      prodUrl: ['', [Validators.required, Validators.maxLength(250)]],
      scope: ['', [Validators.required, Validators.maxLength(20)]],
      tag: ['', [Validators.required, Validators.maxLength(250)]],
      startDate: ['', [Validators.required, Validators.maxLength(25)]],
      endDate: ['', [Validators.required, Validators.maxLength(25)]]
    });
  }

  onSubmit(assessment: FormGroup) {
    this.assessmentModel = assessment.value;
    this.assessmentModel.asset = this.assetId;
    this.createOrUpdateAssessment(this.assessmentModel);
  }

  createOrUpdateAssessment(assessment: Assessment) {
    if (this.assessmentId) {
      assessment.id = this.assessmentId;
      this.appService.updateAssessment(assessment, this.assetId).subscribe((success) => {
        this.navigateToAssessments();
      });
    } else {
      this.appService.createAssessment(this.assessmentModel).subscribe((success) => {
        this.navigateToAssessments();
      });
    }
  }

  navigateToAssessments() {
    this.route.navigate([`organization/${this.orgId}/asset/${this.assetId}`]);
  }
}
