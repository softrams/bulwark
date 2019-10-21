import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from './Asset';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.sass']
})
export class AssetFormComponent implements OnInit, OnChanges {
  public assetModel: Asset;
  public assetForm: FormGroup;
  public assetId: number;
  public orgId: number;
  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    public route: Router,
    public activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['id'];
    });
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  createForm() {
    this.assetForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  rebuildForm() {
    this.assetForm.reset({
      name: this.assetModel.name
    });
  }

  onSubmit(contact: FormGroup) {
    this.assetModel = contact.value;
    this.assetModel.organization = this.orgId;
    this.createOrUpdateAsset(this.assetModel);
    console.log(this.assetModel);
  }

  createOrUpdateAsset(asset: Asset) {
    if (this.assetId) {
      // Add update code
    } else {
      this.appService.createAsset(asset).subscribe(
        (success) => {
          this.location.back();
        },
        (err) => {}
      );
    }
  }
}
