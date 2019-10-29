import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization } from './Organization';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

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
    private sanitizer: DomSanitizer
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

  createForm() {
    this.orgForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      avatar: ['']
    });
  }

  rebuildForm() {
    this.orgForm.reset({
      name: this.orgModel.name,
      avatar: this.orgModel.avatar
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  public getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  onSubmit(contact: FormGroup) {
    this.orgModel = contact.value;
    if (this.fileToUpload) {
      this.appService.upload(this.fileToUpload).subscribe(
        (fileId) => {
          this.orgModel.avatar = +fileId;
          this.createOrUpdateOrg(this.orgModel);
        },
        (error) => {
          // TODO: Handle file upload error
        }
      );
    } else {
      this.createOrUpdateOrg(this.orgModel);
    }
    this.orgForm.reset();
  }

  createOrUpdateOrg(org: Organization) {
    if (this.orgId) {
      this.appService.updateOrg(this.orgId, org).subscribe(
        (success) => {
          this.navigateToDashboard();
        },
        (err) => {}
      );
    } else {
      this.appService.createOrg(org).subscribe(
        (success) => {
          this.navigateToDashboard();
        },
        (err) => {}
      );
    }
  }

  navigateToDashboard() {
    this.route.navigate(['dashboard']);
  }
}
