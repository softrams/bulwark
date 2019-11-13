import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization } from './Organization';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';
@Component({
  selector: 'app-org-form',
  templateUrl: './org-form.component.html',
  styleUrls: ['./org-form.component.sass']
})
export class OrgFormComponent implements OnInit, OnChanges {
  public orgModel: Organization;
  orgForm: FormGroup;
  fileToUpload: File = null;
  avatar: any;
  orgId: number;
  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    public route: Router,
    public activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ organization }) => {
      if (organization) {
        this.orgModel = organization;
        if (this.orgModel['avatarData']) {
          this.appService.getImageById(this.orgModel['avatarData']).then((res) => {
            this.avatar = res;
          });
        }
        this.rebuildForm();
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['id'];
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function required to create the active form in Angular
   * @memberof OrgFormComponent
   */
  createForm() {
    this.orgForm = this.fb.group({
      name: ['', [Validators.required]],
      avatar: ['']
    });
  }

  /**
   * Function required to rebuild the form on changes in Angular
   * @memberof OrgFormComponent
   */
  rebuildForm() {
    this.orgForm.reset({
      name: this.orgModel.name,
      avatar: this.orgModel.avatar
    });
  }

  /**
   * Function required to process the files attached to the form
   * @param {FileList} files array of files to work with
   * @memberof OrgFormComponent
   */
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  /**
   * Function required to process the form data
   * @param {FormGroup} contact form data object holding organization data
   * @memberof OrgFormComponent
   */
  onSubmit(contact: FormGroup) {
    this.orgModel = contact.value;
    if (this.fileToUpload) {
      this.appService.upload(this.fileToUpload).subscribe((fileId) => {
        this.orgModel.avatar = +fileId;
        this.createOrUpdateOrg(this.orgModel);
      });
    } else {
      this.createOrUpdateOrg(this.orgModel);
    }
  }

  /**
   * Function required to create or update an organization based on org ID
   * navigates the user back to the main dashboard after action is executed
   * @param {Organization} org contains organization data object
   * @memberof OrgFormComponent
   */
  createOrUpdateOrg(org: Organization) {
    if (this.orgId) {
      this.appService.updateOrg(this.orgId, org).subscribe((success: string) => {
        this.navigateToDashboard();
        this.alertService.success(success);
      });
    } else {
      this.appService.createOrg(org).subscribe((success: string) => {
        this.navigateToDashboard();
        this.alertService.success(success);
      });
    }
  }

  /**
   * Function responsible for directing the user back to the main dashboard
   * @memberof OrgFormComponent
   */
  navigateToDashboard() {
    this.route.navigate(['dashboard']);
  }
}
