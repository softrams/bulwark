import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from './Asset';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';
@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.sass'],
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
    public activatedRoute: ActivatedRoute,
    private alertService: AlertService
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
      this.orgId = params.id;
      this.assetId = params.assetId;
    });
  }

  /**
   * Function responsible to detect changes for the form and rebuild it
   */
  ngOnChanges() {
    this.rebuildForm();
  }

  /**
   * Function responsible for creating the reactive form in Angular
   */
  createForm() {
    this.assetForm = this.fb.group({
      name: ['', [Validators.required]],
      jiraUsername: ['', []],
      jiraHost: ['', []],
      jiraApiKey: ['', []],
    });
  }

  /**
   * Function responsible for rebuilding the reactive form in Angular
   */
  rebuildForm() {
    this.assetForm.reset({
      name: this.assetModel.name,
      jiraApiKey: this.assetModel.jiraApiKey,
      jiraHost: this.assetModel.jiraHost,
      jiraUsername: this.assetModel.jiraUsername,
    });
  }

  /**
   * Function responsible for processing the data from the reactive from
   * @param asset data object holding all the form data
   */
  onSubmit(asset: FormGroup) {
    this.assetModel = asset.value;
    this.assetModel.organization = this.orgId;
    this.assetModel.id = this.assetId;
    this.createOrUpdateAsset(this.assetModel);
  }

  /**
   * Function responsible for sending the user back to Assets listing
   */
  navigateToAssets() {
    this.route.navigate([`organization/${this.orgId}`]);
  }

  /**
   * Function responsible for creating or updating an asset tied to
   * an organization
   * @param asset object holding all the asset data
   */
  createOrUpdateAsset(asset: Asset) {
    if (this.assetId) {
      this.appService.updateAsset(asset).subscribe((res: string) => {
        this.navigateToAssets();
        this.alertService.success(res);
      });
    } else {
      this.appService.createAsset(asset).subscribe((res: string) => {
        this.navigateToAssets();
        this.alertService.success(res);
      });
    }
  }
}
