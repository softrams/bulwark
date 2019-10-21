import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AppService } from '../app.service';
import { VulnFormEvent } from './vuln-form-event';

@Component({
  selector: 'app-vuln-form',
  templateUrl: './vuln-form.component.html',
  styleUrls: ['./vuln-form.component.sass']
})
export class VulnFormComponent implements OnChanges, OnInit {
  vulnEventFormModel: VulnFormEvent;
  vulnEventForm: FormGroup;
  submitted = false;
  alertType: string;
  alertMessage: string;

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
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  createForm() {
    this.vulnEventForm = this.fb.group({
      impact: ['', Validators.required],
      likelihood: ['', [Validators.required]],
      risk: ['', [Validators.required]],
      systemic: ['', [Validators.required]],
      status: ['', Validators.required],
      description: ['', Validators.required],
      remediation: ['', Validators.required],
      name: ['', Validators.required],
      assessmentId: ['', Validators.required],
      jiraId: ['', Validators.required],
      cvssScore: ['', Validators.required],
      cvssUrl: ['', Validators.required],
      detailedInfo: ['', Validators.required]
    });
  }

  rebuildForm() {
    this.vulnEventForm.reset({
      impact: this.vulnEventFormModel.impact,
      likelihood: this.vulnEventFormModel.likelihood,
      risk: this.vulnEventFormModel.risk,
      systemic: this.vulnEventFormModel.systemic,
      status: this.vulnEventFormModel.status,
      description: this.vulnEventFormModel.description,
      remediation: this.vulnEventFormModel.remediation,
      name: this.vulnEventFormModel.name,
      assessmentId: this.vulnEventFormModel.assessmentId,
      jiraId: this.vulnEventFormModel.jiraId,
      cvssScore: this.vulnEventFormModel.cvssScore,
      cvssUrl: this.vulnEventFormModel.cvssUrl,
      detailedInf: this.vulnEventFormModel.detailedInfo
    });
  }

  onSubmit(contact: FormGroup) {
    // Do stuff
  }
}
