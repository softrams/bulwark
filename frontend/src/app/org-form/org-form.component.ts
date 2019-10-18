import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization } from './Organization';
import { AppService } from '../app.service';

@Component({
  selector: 'app-org-form',
  templateUrl: './org-form.component.html',
  styleUrls: ['./org-form.component.sass']
})
export class OrgFormComponent implements OnInit, OnChanges {
  public orgModel: Organization;
  orgForm: FormGroup;
  fileToUpload: File = null;

  constructor(private fb: FormBuilder, public appService: AppService) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnChanges() {}

  createForm() {
    this.orgForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      file: ['']
    });
  }

  rebuildForm() {
    this.orgForm.reset({
      name: this.orgModel.name,
      description: this.orgModel.description
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  onSubmit(contact: FormGroup) {
    this.orgModel = contact.value;
    //this.orgModel.file = fd;
    this.appService.uploadOrgImage(this.fileToUpload).subscribe(
      (success) => {
        // this.alertMessage = 'Thank you for your submission!  We will get back to you ASAP!';
        // this.alertType = 'success';
        // this.submitted = true;
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
