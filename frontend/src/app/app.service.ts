import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Organization } from './org-form/Organization';
import { Asset } from './asset-form/Asset';
import { Assessment } from './assessment-form/Assessment';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  api = environment.apiUrl;
  /**
   * Function is responsible for initial retrevial of organizations on dashboard loading
   * @returns all organization information to the dashboard
   */
  getOrganizations() {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http
      .get(`${this.api}/organization`)
      .toPromise()
      .then(async (res) => {
        return res;
      });
  }

  /**
   * Function responsible for retreval of organizations archived status.
   * @returns Data for organizations that have been archived.
   */
  getArchivedOrganizations() {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http
      .get(`${this.api}/organization/archive`)
      .toPromise()
      .then(async (res) => {
        return res;
      });
  }

  /**
   * Function is responsible for retreval of images as blogs using the ID association
   * @param file accepts the id assigned to a file
   * @returns the image associated with the id
   */
  getImageById(file: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http
      .get(`${this.api}/file/${file.id}`, httpOptions)
      .toPromise()
      .then((res: Blob) => {
        return this.createObjectUrl(res, file.mimetype);
      });
  }

  /**
   * Function is responsible for retreving an organization based on ID passed
   * @param id is the ID of the organization being requested
   * @returns all information related to the organization requested
   */
  getOrganizationById(id: number) {
    return this.http
      .get(`${this.api}/organization/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  /**
   * Function returns all active assets related to the organization ID
   * @param id is the ID of the organization
   * @returns all assets related to the organization passed
   */
  getOrganizationAssets(id: number) {
    return this.http
      .get(`${this.api}/organization/asset/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  /**
   * Function returns all archived assets related to the organization ID
   * @param id is the ID of the organization
   * @returns all assets related to the organization passed
   */
  getOrganizationArchiveAssets(id: number) {
    return this.http.get(`${this.api}/organization/${id}/asset/archive`);
  }

  /**
   * Function is responsible for archiving an organization by altering it's status
   * @param id is the organization being passed for archiving
   * @returns updates the status of the organization and reports the http status returned
   */
  archiveOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/archive`, null);
  }

  /**
   * Function is responsible for unarchving an organization by alterint it's status
   * @param id is the organization being passed for archiving
   * @returns updates the status of the organization and reports the http status returned
   */
  activateOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/activate`, null);
  }

  /**
   * Function is responsible for returning all assessements related to an organization
   * @param id is the organization ID associated with the assessements
   * @returns all assessments related to the organization
   */
  getAssessments(id: number) {
    return this.http
      .get(`${this.api}/assessment/${id}`)
      .toPromise()
      .then((res) => {
        return res as object[];
      });
  }

  /**
   * Delete assessment by ID
   * @returns success/error message
   */
  deleteAssessment(assessmentId: number) {
    return this.http.delete(`${this.api}/assessment/${assessmentId}`);
  }

  /**
   * Function is responsible for returning all vulnerabilites related to an assessment
   * @param assessmentId is the ID associated with the assessment
   * @returns all vulnerablities related to the assessment
   */
  getVulnerabilities(assessmentId: number) {
    return this.http
      .get(`${this.api}/assessment/${assessmentId}/vulnerability`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  /**
   * Function is responsible for returning a vulnerablity called by it's ID
   * @param id associated to the vulnerability requested
   * @returns all object related data to the vulnerability requested
   */
  getVulnerability(id: number) {
    return this.http.get(`${this.api}/vulnerability/${id}`);
  }

  exportVulnToJira(vulnId: number) {
    return this.http.get(`${this.api}/vulnerability/jira/${vulnId}`);
  }

  exportAssessmentToJira(assessmentId: number) {
    return this.http.get(`${this.api}/assessment/jira/${assessmentId}`);
  }

  getConfig() {
    return this.http.get(`${this.api}/config`);
  }

  updateConfig(config: FormData) {
    return this.http.post(`${this.api}/config`, config);
  }

  /**
   * Function is responsible for updating a vulnerability by ID
   * @param id is associated with the requested vulnerability
   * @param vuln is associated with the form data passed as an object
   * @returns http status code for the return value
   */
  updateVulnerability(id: number, vuln: FormData) {
    return this.http.patch(`${this.api}/vulnerability/${id}`, vuln);
  }

  /**
   * Function is responsible for creating a vulnerability for an assessment
   * @param vuln contains the form object data for all required fields
   * @returns http status code of the request
   */
  createVuln(vuln: FormData) {
    return this.http.post(`${this.api}/vulnerability`, vuln);
  }

  /**
   * Function is responsible for deletion of a vulnerability
   * @param vulnId is the ID association to the vulnerability
   * @returns http status code of the request
   */
  deleteVuln(vulnId: number) {
    return this.http.delete(`${this.api}/vulnerability/${vulnId}`);
  }

  /**
   * Function is responsible for creating a new organization
   * @param org object of the form data passed to the API
   * @returns http status code of the request
   */
  createOrg(org: Organization) {
    return this.http.post(`${this.api}/organization`, org);
  }

  /**
   * Function is responsible for updating an organization
   * @param id is the organization ID being updated
   * @param org is the form object data passed to the API
   * @returns http status code of the request
   */
  updateOrg(id: number, org: Organization) {
    return this.http.patch(`${this.api}/organization/${id}`, org);
  }

  /**
   * Function is responsible for creating a new asset tied to an organization
   * @param asset is the form object data for the new asset
   * @returns http status code of the request
   */
  createAsset(asset: Asset) {
    return this.http.post(
      `${this.api}/organization/${asset.organization}/asset`,
      asset
    );
  }

  purgeJira(assetId: number) {
    return this.http.delete(`${this.api}/asset/jira/${assetId}`);
  }

  /**
   * Function is responsible for fetching assets
   * @param assetId asset ID being requested
   * @param orgId associated organization ID attached to the asset
   * @returns https status code of the request
   */
  getAsset(assetId: number, orgId: number) {
    return this.http.get(`${this.api}/organization/${orgId}/asset/${assetId}`);
  }

  /**
   * Function is responsible for updating an asset
   * @param asset is the ID associated to the asset
   * @returns http status code of the request
   */
  updateAsset(asset: Asset) {
    return this.http.patch(
      `${this.api}/organization/${asset.organization}/asset/${asset.id}`,
      asset
    );
  }

  /**
   * Function is responsible for archiving an asset
   * @param asset is the ID associated to the asset
   * @returns http status code of the request
   */
  archiveAsset(asset: Asset) {
    return this.http.patch(`${this.api}/asset/archive/${asset.id}`, {});
  }

  /**
   * Function is responsible for activating an asset
   * @param asset is the ID associated to the asset
   * @returns http status code of the request
   */
  activateAsset(asset: Asset) {
    return this.http.patch(`${this.api}/asset/activate/${asset.id}`, {});
  }

  /**
   * Function is responsible for creating new assessments
   * @param assessment data contained in the assessment form object
   * @returns http status code of the request
   */
  createAssessment(assessment: Assessment) {
    return this.http.post(`${this.api}/assessment`, assessment);
  }

  /**
   * Function is responsible for updating an assessment's data
   * @param assessment form object data of the assessment
   * @param assessmentId associated ID of the assessment being altered
   * @param assetId asset ID attached to the request ties into the assessment ID
   * @returns http status code of the request
   */
  updateAssessment(
    assessment: Assessment,
    assessmentId: number,
    assetId: number
  ) {
    return this.http.patch(
      `${this.api}/asset/${assetId}/assessment/${assessmentId}`,
      assessment
    );
  }

  /**
   * Function is responsible for retrevial of assessments
   * @param assetId associated asset ID required
   * @param assessmentId associated assessment ID required
   * @returns http status code with object data from the API call
   */
  getAssessment(assetId: number, assessmentId: number) {
    return this.http.get(
      `${this.api}/asset/${assetId}/assessment/${assessmentId}`
    );
  }

  /**
   * Function is responsible for uploading files, attaching them to the resource requesting it
   * @param fileToUpload form object data for the files associated in the request
   * @returns http status code of the request
   */
  upload(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload);
    return this.http.post(`${this.api}/upload`, formData);
  }

  /**
   * Function is responsible for uploading multi-part data associated with files.
   * @param fileToUpload form object data holding the file objects required
   * @returns http status code of the request
   */
  uploadMultiple(fileToUpload: FormData) {
    return this.http.post(`${this.api}/upload-multiple`, fileToUpload);
  }

  /**
   * Function is responsible for report retrevial
   * @param assessmentId required ID of the assessment for object data relations
   * @returns http status request and object data for the report
   */
  getReport(assessmentId: number) {
    return this.http.get(`${this.api}/assessment/${assessmentId}/report`);
  }

  /**
   * Function is responsible for report generation
   * @param orgId requires associated data from the organization ID
   * @param assetId requires associated data from the asset ID
   * @param assessmentId requires associated data from the assessment ID
   * @returns http status code of the request along with a new tab with a generated report
   */
  generateReport(orgId: number, assetId: number, assessmentId: number) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    const generateObject = {
      orgId,
      assetId,
      assessmentId,
    };
    return this.http.post(
      `${this.api}/report/generate`,
      generateObject,
      httpOptions
    );
  }

  /**
   * Function is responsible for generating URL's to provide accessable data, reports, images, and
   * any other downloadble content.
   * @param file requires the file object to be called
   * @param [mimetype] requires the mimetype of the data
   * @returns new URL with the object requested in a sanatized manner
   */
  public createObjectUrl(file, mimetype?: string) {
    // Preview unsaved form
    const blob = new Blob([file], {
      type: mimetype || file.type,
    });
    const url = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
