import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from './Asset';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
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
  public keyPlaceholder = '************************';
  public canAddApiKey = true;
  public isAdmin: boolean;
  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    public route: Router,
    public activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    public authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ asset }) => {
      this.isAdmin = this.authService.isAdmin();
      if (asset) {
        this.assetModel = asset;
        if (!this.isAdmin) {
          this.assetForm.disable();
        }
        this.rebuildForm();
        if (asset.jira) {
          this.canAddApiKey = false;
        } else {
          this.canAddApiKey = true;
        }
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
      jira: this.fb.group({
        username: ['', []],
        host: ['', []],
        apiKey: ['', []],
      }),
    });
  }

  /**
   * Function responsible for rebuilding the reactive form in Angular
   */
  rebuildForm() {
    this.assetForm.reset({
      name: this.assetModel.name,
      jira: {
        username: this.assetModel?.jira?.username,
        host: this.assetModel?.jira?.host,
        apiKey: this.assetModel?.jira?.apiKey,
      },
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
    if (!this.canAddApiKey) {
      this.assetModel.jira = null;
    }
    this.createOrUpdateAsset(this.assetModel);
  }

  /**
   * Function responsible for sending the user back to Assets listing
   */
  navigateToAssets() {
    this.route.navigate([`organization/${this.orgId}`]);
  }

  purgeJiraInfo() {
    const r = confirm(`Purge API Key for Asset: "${this.assetModel.name}"?`);
    if (r) {
      this.appService.purgeJira(this.assetId).subscribe((res: string) => {
        this.alertService.success(res);
        this.appService
          .getAsset(this.assetId, this.orgId)
          .subscribe((asset: Asset) => {
            this.assetModel = asset;
            this.canAddApiKey = true;
            this.rebuildForm();
          });
      });
    }
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
