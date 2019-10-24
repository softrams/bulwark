import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AppService } from '../app.service';
import { Vulnerability } from './Vulnerability';

@Component({
  selector: 'app-vuln-form',
  templateUrl: './vuln-form.component.html',
  styleUrls: ['./vuln-form.component.sass']
})
export class VulnFormComponent implements OnChanges, OnInit {
  vulnModel: Vulnerability;
  vulnForm: FormGroup;
  submitted = false;
  alertType: string;
  alertMessage: string;
  orgId: string;
  assetId: string;
  assessmentId: string;
  vulnId: number;
  filesToUpload: FormData;
  constructor(
    private appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe();
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['orgId'];
      this.assetId = params['assetId'];
      this.assessmentId = params['assessmentId'];
      this.vulnId = params['vulnId'];
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  createForm() {
    this.vulnForm = this.fb.group({
      impact: ['', [Validators.required, Validators.maxLength(6)]],
      likelihood: ['', [Validators.required, Validators.maxLength(6)]],
      risk: ['', [Validators.required, Validators.maxLength(13)]],
      systemic: ['', [Validators.required]],
      status: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      remediation: ['', [Validators.required, Validators.maxLength(2000)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      jiraId: ['', [Validators.required, Validators.maxLength(15)]],
      cvssScore: ['', Validators.required],
      cvssUrl: ['', Validators.required],
      detailedInfo: ['', [Validators.required, Validators.maxLength(2000)]],
      screenshots: ['']
    });
  }

  rebuildForm() {
    this.vulnForm.reset({
      impact: this.vulnModel.impact,
      likelihood: this.vulnModel.likelihood,
      risk: this.vulnModel.risk,
      systemic: this.vulnModel.systemic,
      status: this.vulnModel.status,
      description: this.vulnModel.description,
      remediation: this.vulnModel.remediation,
      name: this.vulnModel.name,
      jiraId: this.vulnModel.jiraId,
      cvssScore: this.vulnModel.cvssScore,
      cvssUrl: this.vulnModel.cvssUrl,
      detailedInfo: this.vulnModel.detailedInfo
    });
  }

  handleFileInput(files: FileList) {
    this.filesToUpload = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      this.filesToUpload.append('screenshots', file);
    }
  }

  navigateToVulnerabilities() {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${this.assessmentId}/vulnerability`
    ]);
  }

  onSubmit(vulnForm: FormGroup) {
    this.vulnModel = vulnForm.value;
    this.filesToUpload.append('impact', this.vulnModel.impact);
    this.filesToUpload.append('likelihood', this.vulnModel.likelihood);
    this.filesToUpload.append('risk', this.vulnModel.risk);
    this.filesToUpload.append('systemic', this.vulnModel.systemic);
    this.filesToUpload.append('status', this.vulnModel.status);
    this.filesToUpload.append('description', this.vulnModel.description);
    this.filesToUpload.append('remediation', this.vulnModel.remediation);
    this.filesToUpload.append('jiraId', this.vulnModel.jiraId);
    this.filesToUpload.append('cvssScore', this.vulnModel.cvssScore.toString());
    this.filesToUpload.append('cvssUrl', this.vulnModel.cvssUrl);
    this.filesToUpload.append('detailedInfo', this.vulnModel.detailedInfo);
    this.filesToUpload.append('assessment', this.assessmentId);
    this.filesToUpload.append('name', this.vulnModel.name);
    this.vulnModel.assessment = +this.assessmentId;
    this.vulnModel.screenshots = this.filesToUpload;
    console.log(this.vulnModel.screenshots.getAll('screenshots'));
    this.createOrUpdateVuln(this.filesToUpload);
  }

  createOrUpdateVuln(vuln: FormData) {
    if (this.vulnId) {
      // Do update
    } else {
      this.appService.createVuln(vuln).subscribe((success) => {
        this.navigateToVulnerabilities();
      });
    }
  }
}
