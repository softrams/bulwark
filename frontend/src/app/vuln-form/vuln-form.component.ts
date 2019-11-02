import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { AppService } from '../app.service';
import { Vulnerability } from './Vulnerability';
import { faTrash, faPlus, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AppFile } from '../classes/App_File';
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
  vulnFormData: FormData;
  tempScreenshots: object[] = [];
  screenshotsToDelete: number[] = [];
  faTrash = faTrash;
  faPlus = faPlus;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  previewDescription = false;
  previewDetailedDesc = false;
  previewRemediation = false;

  constructor(
    private appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ vulnerability }) => {
      if (vulnerability) {
        this.vulnModel = vulnerability;
        for (const probLoc of vulnerability.problemLocations) {
          this.probLocArr.push(
            this.fb.group({
              id: probLoc.id,
              location: probLoc.location,
              target: probLoc.target
            })
          );
        }
        for (const resource of vulnerability.resources) {
          this.resourceArr.push(
            this.fb.group({
              id: resource.id,
              description: resource.description,
              url: resource.url
            })
          );
        }
        for (const file of vulnerability['screenshots']) {
          const existFile: AppFile = file;
          this.appService.getImageById(existFile).then((url) => {
            existFile.imgUrl = url;
            this.previewScreenshot(null, existFile);
          });
        }
        this.vulnForm.patchValue(vulnerability);
      }
    });
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
      impact: ['', [Validators.required]],
      likelihood: ['', [Validators.required]],
      risk: ['', [Validators.required]],
      systemic: ['', [Validators.required]],
      status: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(4000)]],
      remediation: ['', [Validators.required, Validators.maxLength(4000)]],
      name: ['', [Validators.required]],
      jiraId: ['', []],
      cvssScore: ['', Validators.required],
      cvssUrl: ['', Validators.required],
      detailedInfo: ['', [Validators.required, Validators.maxLength(4000)]],
      problemLocations: this.fb.array([]),
      resources: this.fb.array([])
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
      detailedInfo: this.vulnModel.detailedInfo,
      problemLocations: this.vulnModel.problemLocations,
      resources: this.vulnModel.resources
    });
  }

  get probLocArr() {
    return this.vulnForm.get('problemLocations') as FormArray;
  }

  initProbLocRows(): FormGroup {
    return this.fb.group({
      location: '',
      target: ''
    });
  }

  addProbLoc() {
    this.probLocArr.push(this.initProbLocRows());
  }

  deleteProbLoc(index: number) {
    this.probLocArr.removeAt(index);
  }

  get resourceArr() {
    return this.vulnForm.get('resources') as FormArray;
  }

  initResourceRows(): FormGroup {
    return this.fb.group({
      description: '',
      url: ''
    });
  }

  addResource() {
    this.resourceArr.push(this.initResourceRows());
  }

  deleteResource(index: number) {
    this.resourceArr.removeAt(index);
  }

  handleFileInput(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      this.previewScreenshot(file, null);
    }
  }

  previewScreenshot(file: File, existFile: AppFile) {
    // Image from DB
    if (existFile) {
      const renderObj = {
        url: this.getSantizeUrl(existFile.imgUrl),
        file: existFile
      };
      this.tempScreenshots.push(renderObj);
    } else {
      // Preview unsaved form
      const blob = new Blob([file], {
        type: file.type
      });
      const url = window.URL.createObjectURL(blob);
      // File objects do not have an `originalname` property
      file['originalname'] = file.name;
      const renderObj = {
        url: this.getSantizeUrl(url),
        file: file
      };
      this.tempScreenshots.push(renderObj);
    }
  }

  deleteScreenshot(file: File) {
    const index = this.tempScreenshots.indexOf(file);
    if (index > -1) {
      this.screenshotsToDelete.push(file['file']['id']);
      this.tempScreenshots.splice(index, 1);
    }
  }

  finalizeScreenshots(screenshots: object[], screenshotsToDelete: number[]) {
    this.vulnFormData.delete('screenshots');
    if (screenshots.length) {
      for (const screenshot of screenshots) {
        this.vulnFormData.append('screenshots', screenshot['file']);
      }
    }
    if (screenshotsToDelete.length) {
      this.vulnFormData.append('screenshotsToDelete', JSON.stringify(screenshotsToDelete));
    }
  }

  public getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  navigateToVulnerabilities() {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${this.assessmentId}/vulnerability`
    ]);
  }

  onSubmit(vulnForm: FormGroup) {
    this.vulnFormData = new FormData();
    const newScreenshots = this.tempScreenshots.filter((screenshot) => !screenshot['file'].id);
    this.finalizeScreenshots(newScreenshots, this.screenshotsToDelete);
    this.vulnModel = vulnForm.value;
    this.vulnFormData.append('impact', this.vulnModel.impact);
    this.vulnFormData.append('likelihood', this.vulnModel.likelihood);
    this.vulnFormData.append('risk', this.vulnModel.risk);
    this.vulnFormData.append('systemic', this.vulnModel.systemic);
    this.vulnFormData.append('status', this.vulnModel.status);
    this.vulnFormData.append('description', this.vulnModel.description);
    this.vulnFormData.append('remediation', this.vulnModel.remediation);
    this.vulnFormData.append('jiraId', this.vulnModel.jiraId);
    this.vulnFormData.append('cvssScore', this.vulnModel.cvssScore.toString());
    this.vulnFormData.append('cvssUrl', this.vulnModel.cvssUrl);
    this.vulnFormData.append('detailedInfo', this.vulnModel.detailedInfo);
    this.vulnFormData.append('assessment', this.assessmentId);
    this.vulnFormData.append('name', this.vulnModel.name);
    this.vulnFormData.append('problemLocations', JSON.stringify(this.vulnModel.problemLocations));
    this.vulnFormData.append('resources', JSON.stringify(this.vulnModel.resources));
    this.createOrUpdateVuln(this.vulnFormData);
  }

  createOrUpdateVuln(vuln: FormData) {
    if (this.vulnId) {
      this.appService.updateVulnerability(this.vulnId, vuln).subscribe((success) => {
        this.navigateToVulnerabilities();
      });
    } else {
      this.appService.createVuln(vuln).subscribe(
        (success) => {
          this.navigateToVulnerabilities();
        },
        (error) => {
          // Reset current form data to avoid duplicate inputs
          this.vulnFormData = new FormData();
        }
      );
    }
  }

  toggleDescPreview() {
    this.previewDescription = !this.previewDescription;
  }
  toggleDetailedDescPreview() {
    this.previewDetailedDesc = !this.previewDetailedDesc;
  }
  toggleRemediationPreview() {
    this.previewRemediation = !this.previewRemediation;
  }
}
