import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization } from './Organization';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org-form',
  templateUrl: './org-form.component.html',
  styleUrls: ['./org-form.component.sass']
})
export class OrgFormComponent implements OnInit, OnChanges {
  public orgModel: Organization;
  orgForm: FormGroup;
  fileToUpload: File = null;

  constructor(private fb: FormBuilder, public appService: AppService, public route: Router) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnChanges() {}

  createForm() {
    this.orgForm = this.fb.group({
      name: ['', Validators.required],
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

  onSubmit(contact: FormGroup) {
    this.orgModel = contact.value;
    this.appService.upload(this.fileToUpload).subscribe(
      (fileId) => {
        this.orgModel.avatar = +fileId;
        this.appService.createOrg(this.orgModel).subscribe(
          (success) => {
            this.route.navigate(['dashboard']);
            // TODO:  Alert messages
            // this.alertMessage = 'Thank you for your submission!  We will get back to you ASAP!';
            // this.alertType = 'success';
            // this.submitted = true;
          },
          (err) => {
            // this.alertMessage = 'Something went wrong!  Please try again later.';
            // this.alertType = 'danger';
            // this.submitted = true;
          }
        );
      },
      (error) => {
        // this.alertMessage = 'Something went wrong!  Please try again later.';
        // this.alertType = 'danger';
        // this.submitted = true;
      }
    );
    this.orgForm.reset();
  }
}
