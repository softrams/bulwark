import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { AlertService } from '../alert/alert.service';
import { Vulnerability } from './Vulnerability';
import { AppFile } from '../interfaces/App_File';
import { Screenshot } from '../interfaces/Screenshot';

@Component({
  selector: 'app-vuln-form',
  templateUrl: './vuln-form.component.html',
  styleUrls: ['./vuln-form.component.sass'],
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
  jiraHost: string;
  tempScreenshots: Screenshot[] = [];
  screenshotsToDelete: number[] = [];
  previewDescription = false;
  previewDetailedDesc = false;
  previewRemediation = false;
  impactAssess = 0;
  likelihoodAssess = 0;
  riskAssess = 0;
  readOnly: boolean;
  constructor(
    private appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.createForm();
  }

  /**
   * Specific to the vulnerability form, init is called to retreive all data associated with the vuln-form component
   * Attach subscriptions to likelihood and impact for dynamic risk attribute in the form
   */
  ngOnInit() {
    this.vulnForm.get('impact').valueChanges.subscribe((value) => {
      if (this.impactAssess === 0) {
        if (value === 'High') {
          this.impactAssess += 3;
        } else if (value === 'Medium') {
          this.impactAssess += 2;
        } else {
          this.impactAssess += 1;
        }
        this.updateRisk();
      } else {
        this.impactAssess = 0;
        if (value === 'High') {
          this.impactAssess += 3;
        } else if (value === 'Medium') {
          this.impactAssess += 2;
        } else {
          this.impactAssess += 1;
        }
        this.updateRisk();
      }
    });
    this.vulnForm.get('likelihood').valueChanges.subscribe((value) => {
      if (this.likelihoodAssess === 0) {
        if (value === 'High') {
          this.likelihoodAssess += 3;
        } else if (value === 'Medium') {
          this.likelihoodAssess += 2;
        } else {
          this.likelihoodAssess += 1;
        }
        this.updateRisk();
      } else {
        this.likelihoodAssess = 0;
        if (value === 'High') {
          this.likelihoodAssess += 3;
        } else if (value === 'Medium') {
          this.likelihoodAssess += 2;
        } else {
          this.likelihoodAssess += 1;
        }
        this.updateRisk();
      }
    });
    this.activatedRoute.data.subscribe(({ vulnInfo }) => {
      this.readOnly = vulnInfo.readOnly;
      if (this.readOnly) {
        this.vulnForm.disable();
      }
      if (vulnInfo && vulnInfo.jiraHost) {
        this.jiraHost = vulnInfo.jiraHost;
      }
      if (vulnInfo && vulnInfo.vulnerability) {
        this.vulnModel = vulnInfo.vulnerability;
        for (const probLoc of vulnInfo.vulnerability.problemLocations) {
          this.probLocArr.push(
            this.fb.group({
              id: probLoc.id,
              location: probLoc.location,
              target: probLoc.target,
            })
          );
        }
        for (const resource of vulnInfo.vulnerability.resources) {
          this.resourceArr.push(
            this.fb.group({
              id: resource.id,
              description: resource.description,
              url: resource.url,
            })
          );
        }
        for (const file of vulnInfo.vulnerability.screenshots) {
          const existFile: AppFile = file;
          this.appService.getImageById(existFile).then((url) => {
            existFile.imgUrl = url;
            this.previewScreenshot(null, existFile);
          });
        }
        this.vulnForm.patchValue(vulnInfo.vulnerability);
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params.orgId;
      this.assetId = params.assetId;
      this.assessmentId = params.assessmentId;
      this.vulnId = params.vulnId;
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function responsible for the generation of the Vulnerability form
   * this is a requirement for reactive forms in Angular
   */
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
      resources: this.fb.array([]),
    });
  }

  /**
   * Function is required to rebuild the form when requested it is required
   * for reactive forms in Angular
   */
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
      resources: this.vulnModel.resources,
    });
  }

  /**
   * Gets array with all stored problem locations for retrevial by the UI
   * @return problem location array data to be passed into the form for submission
   */
  get probLocArr() {
    return this.vulnForm.get('problemLocations') as FormArray;
  }

  /**
   * Function responsible for initializing the form fields for location and target
   * needed for pulling data when a vulnerability is edited or a new vulnerability resource
   * is added by the user with the '+' icon, specific to Problem Location
   */
  initProbLocRows(): FormGroup {
    return this.fb.group({
      location: '',
      target: '',
    });
  }

  /**
   * Function responsible for adding content into the ProbLocArr[]
   * Populates within the reactive form for submission later in the process
   */
  addProbLoc() {
    this.probLocArr.push(this.initProbLocRows());
  }

  /**
   * Function responsible for removing content from the ProbLocArr[]
   * Removes elements from the array by index value
   * @param index is the ID of the index to be removed from the array
   */
  deleteProbLoc(index: number) {
    this.probLocArr.removeAt(index);
  }

  /**
   * Get array with all stored resources required within the Vulnerability form
   * later used in the form submission call
   * @return retuns the array of resource locations added into the vulnerability form
   */
  get resourceArr() {
    return this.vulnForm.get('resources') as FormArray;
  }

  /**
   * Function responsible for initializing the form fields for description and url
   * needed for pulling data when a vulnerability is edited or a new vulnerability resource
   * is added by the user with the '+' icon, specific to Resources
   */
  initResourceRows(): FormGroup {
    return this.fb.group({
      description: '',
      url: '',
    });
  }

  /**
   * Function responsible for adding form data to the Resource Array
   * utilizing the data within the reactive form
   */
  addResource() {
    this.resourceArr.push(this.initResourceRows());
  }

  /**
   * Function responsible for deletion of a resource from the form
   * @param index is the associated value of the array index value to be removed
   */
  deleteResource(index: number) {
    this.resourceArr.removeAt(index);
  }

  /**
   * Function is responsible for processing a file array to be used in the form
   * iterates over all attached files to be processed
   */
  handleFileInput(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      this.previewScreenshot(file, null);
    }
  }

  /**
   * Function responsible for retreiving an image and processing it back to the UI
   * renders it back to the browser using the createObjectUrl feature
   */
  previewScreenshot(file: File, existFile: AppFile) {
    // Image from DB
    if (existFile) {
      const screenshot: Screenshot = {
        url: existFile.imgUrl,
        file: existFile,
        fileName: existFile.originalname,
        fileId: existFile.id,
      };
      this.tempScreenshots.push(screenshot);
    } else {
      const screenshot: Screenshot = {
        url: this.appService.createObjectUrl(file),
        file,
        fileName: file.name,
        fileId: null,
      };
      this.tempScreenshots.push(screenshot);
    }
  }

  /**
   * Function responsible for removal of screenshots from the Vulnerability Form
   * @param file the associated index of the file to be removed
   */
  deleteScreenshot(screenshot: Screenshot) {
    const index = this.tempScreenshots.indexOf(screenshot);
    if (index > -1) {
      this.screenshotsToDelete.push(screenshot.fileId);
      this.tempScreenshots.splice(index, 1);
    }
  }

  /**
   * Function responsible for populating the screenshot array and removal
   * of screenshots performed during data entry
   * @param screenshots object data for screenshots to be processed
   * @param screenshotsToDelete object data for screenshots to be removed
   */
  finalizeScreenshots(
    screenshots: Screenshot[],
    screenshotsToDelete: number[]
  ) {
    this.vulnFormData.delete('screenshots');
    if (screenshots.length) {
      for (const screenshot of screenshots) {
        this.vulnFormData.append('screenshots', screenshot.file);
      }
    }
    if (screenshotsToDelete.length) {
      this.vulnFormData.append(
        'screenshotsToDelete',
        JSON.stringify(screenshotsToDelete)
      );
    }
  }

  /**
   * Function to navigate to Vulnerabilities, takes no input from the user
   */
  navigateToVulnerabilities() {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${this.assessmentId}/vulnerability`,
    ]);
  }

  /**
   * Function responsible for handling the form submission objects and data
   * @param vulnForm form object holding data to be processed
   */
  onSubmit(vulnForm: FormGroup) {
    this.vulnFormData = new FormData();
    const newScreenshots = this.tempScreenshots.filter(
      (screenshot) => !screenshot.fileId
    );
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
    this.vulnFormData.append(
      'problemLocations',
      JSON.stringify(this.vulnModel.problemLocations)
    );
    this.vulnFormData.append(
      'resources',
      JSON.stringify(this.vulnModel.resources)
    );
    this.createOrUpdateVuln(this.vulnFormData);
  }

  /**
   * Function responsible for handling the vulnerability form data
   * processes the data for either creation or updating a vulnerability
   * @param vuln form object holding all data to be processed
   */
  createOrUpdateVuln(vuln: FormData) {
    if (this.vulnId) {
      this.appService
        .updateVulnerability(this.vulnId, vuln)
        .subscribe((res: string) => {
          this.navigateToVulnerabilities();
          this.alertService.success(res);
        });
    } else {
      this.appService.createVuln(vuln).subscribe((res: string) => {
        this.navigateToVulnerabilities();
        this.alertService.success(res);
      });
    }
  }

  /**
   * Function responsible for either showing a preview or hiding a preview
   * within the form for showing the data in markup or as regular text for
   * Description
   */
  toggleDescPreview() {
    this.previewDescription = !this.previewDescription;
  }

  /**
   * Function responsible for either showing a preview or hiding a preview
   * within the form showing the data in markup or as regular text for
   * Detailed Information
   */
  toggleDetailedDescPreview() {
    this.previewDetailedDesc = !this.previewDetailedDesc;
  }

  /**
   * Function responsible for either showing a preview or hiding a preview
   * within the form showing the data in markup or as regular text for
   * Remediation
   */
  toggleRemediationPreview() {
    this.previewRemediation = !this.previewRemediation;
  }

  /**
   * Function responsible for updating the risk value on the vulnerability form
   * based on impact and likelihood value held within the vuln-form object
   */
  updateRisk() {
    const value: number = this.impactAssess + this.likelihoodAssess;
    this.riskAssess = value;

    if (value === 6) {
      this.vulnForm.patchValue({
        risk: 'Critical',
      });
    } else if (value === 5) {
      this.vulnForm.patchValue({
        risk: 'High',
      });
    } else if (value === 4) {
      this.vulnForm.patchValue({
        risk: 'Medium',
      });
    } else if (value === 3) {
      this.vulnForm.patchValue({
        risk: 'Low',
      });
    } else {
      this.vulnForm.patchValue({
        risk: 'Informational',
      });
    }
  }

  exportToJira() {
    const r = confirm(
      `Export vulnerability "${this.vulnModel.name}" to Jira host: ${this.jiraHost}?`
    );
    if (r) {
      if (this.vulnForm.dirty) {
        this.alertService.warn(
          'Vulnerability form updates detected.  Please save the vulnerability before exporting to JIRA.'
        );
      } else {
        this.appService
          .exportVulnToJira(this.vulnId)
          .subscribe((res: string) => {
            this.navigateToVulnerabilities();
            this.alertService.success(res);
          });
      }
    }
  }
}
