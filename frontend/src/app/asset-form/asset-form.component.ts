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
    });
  }

  /**
   * Function responsible to detect changes for the form and rebuild it
   * @memberof AssetFormComponent
   */
  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function responsible for creating the reactive form in Angular
   * @memberof AssetFormComponent
   */
  createForm() {
    this.assetForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  /**
   * Function responsible for rebuilding the reactive form in Angular
   * @memberof AssetFormComponent
   */
  rebuildForm() {
    this.assetForm.reset({
      name: this.assetModel.name
    });
  }

  /**
   * Function responsible for processing the data from the reactive from
   * @param {FormGroup} asset data object holding all the form data
   * @memberof AssetFormComponent
   */
  onSubmit(asset: FormGroup) {
    this.assetModel = asset.value;
    this.assetModel.organization = this.orgId;
    this.assetModel.id = this.assetId;
    this.createOrUpdateAsset(this.assetModel);
  }

  /**
   * Function responsible for sending the user back to Assets listing
   * @memberof AssetFormComponent
   */
  navigateToAssets() {
    this.route.navigate([`organization/${this.orgId}`]);
  }

  /**
   * Function responsible for creating or updating an asset tied to
   * an organization
   * @param {Asset} asset object holding all the asset data
   * @memberof AssetFormComponent
   */
  createOrUpdateAsset(asset: Asset) {
    if (this.assetId) {
      this.appService.updateAsset(asset).subscribe((success) => {
        this.navigateToAssets();
      });
    } else {
      this.appService.createAsset(asset).subscribe(
        (success) => {
          this.navigateToAssets();
        },
        (err) => {}
      );
    }
  }
}
