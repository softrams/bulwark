import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from './Asset';
import { AppService } from '../app.service';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.sass']
})
export class AssetFormComponent implements OnInit, OnChanges {
  public assetModel: Asset;
  public assetForm: FormGroup;
  public orgId: number;
  public assetId: number;
  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    public route: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ asset }) => {
      if (asset) {
        this.assetModel = asset;
        this.rebuildForm();
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['id'];
      this.assetId = params['assetId'];
      console.log(this.orgId, this.assetId);
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
    this.assetModel.id = this.assetId;
    this.createOrUpdateAsset(this.assetModel);
  }

  createOrUpdateAsset(asset: Asset) {
    if (this.assetId) {
      this.appService.updateAsset(asset).subscribe((success) => {
        this.route.navigate([`organization/${this.orgId}`]);
      });
    } else {
      this.appService.createAsset(asset).subscribe(
        (success) => {
          this.route.navigate([`organization/${this.orgId}`]);
        },
        (err) => {}
      );
    }
  }
}
