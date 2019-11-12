import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Organization } from './org-form/Organization';
import { Asset } from './asset-form/Asset';
import { Assessment } from './assessment-form/Assessment';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  api = environment.apiUrl;
  // TODO:  Delete this monstrosity that I have created
  //       Please forgive me coding gods!
  //       We need to find a better solution than to individually
  //       query for each image.  This will not work well with reports!

  /**
   * Function is responsible for initial retrevial of organizations on dashboard loading
   * @returns all organization information to the dashboard
   * @memberof AppService
   */
  getOrganizations() {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http
      .get(`${this.api}/organization`)
      .toPromise()
      .then(async (res) => {
        const orgs: any = res;
        let count = 0;
        for (let i = 0; i < orgs.length; i++) {
          if (orgs[i].avatar && orgs[i].avatar.buffer) {
            await this.http
              .get(`${this.api}/file/${orgs[i].avatar.id}`, httpOptions)
              .toPromise()
              .then(async (blob: Blob) => {
                orgs[i].imgUrl = this.createObjectUrl(blob, orgs[i].avatar.mimetype);
                count++;
              });
          } else {
            count++;
          }
        }
        if (count === orgs.length) {
          return orgs;
        }
      });
  }

  /**
   * Function responsible for retreval of organizations archived status.
   * @returns Data for organizations that have been archived.
   * @memberof AppService
   */
  getArchivedOrganizations() {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http
      .get(`${this.api}/organization/archive`)
      .toPromise()
      .then(async (res) => {
        const orgs: any = res;
        let count = 0;
        for (let i = 0; i < orgs.length; i++) {
          if (orgs[i].avatar && orgs[i].avatar.buffer) {
            await this.http
              .get(`${this.api}/file/${orgs[i].avatar.id}`, httpOptions)
              .toPromise()
              .then(async (blob: Blob) => {
                orgs[i].imgUrl = this.createObjectUrl(blob, orgs[i].avatar.mimetype);
                count++;
              });
          } else {
            count++;
          }
        }
        if (count === orgs.length) {
          return orgs;
        }
      });
  }

  /**
   * Function is responsible for retreval of images as blogs using the ID association
   * @param {*} file accepts the id assigned to a file
   * @returns the image associated with the id
   * @memberof AppService
   */
  getImageById(file: any) {
    const httpOptions = {
      responseType: 'blob' as 'json'
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
   * @param {number} id is the ID of the organization being requested
   * @returns all information related to the organization requested
   * @memberof AppService
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
   * Function returns all assests related to the organization ID
   * @param {number} id is the ID of the organization
   * @returns all assets related to the organization passed
   * @memberof AppService
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
   * Function is responsible for archiving an organization by altering it's status
   * @param {number} id is the organization being passed for archiving
   * @returns updates the status of the organization and reports the http status returned
   * @memberof AppService
   */
  archiveOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/archive`, null);
  }

  /**
   * Function is responsible for unarchving an organization by alterint it's status
   * @param {number} id is the organization being passed for archiving
   * @returns updates the status of the organization and reports the http status returned
   * @memberof AppService
   */
  activateOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/activate`, null);
  }

  /**
   * Function is responsible for returning all assessements related to an organization
   * @param {number} id is the organization ID associated with the assessements
   * @returns all assessments related to the organization
   * @memberof AppService
   */
  getAssessments(id: number) {
    return this.http
      .get(`${this.api}/assessment/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  /**
   * Function is responsible for returning all vulnerabilites related to an assessment
   * @param {number} assessmentId is the ID associated with the assessment
   * @returns all vulnerablities related to the assessment
   * @memberof AppService
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
   * @param {number} id associated to the vulnerability requested
   * @returns all object related data to the vulnerability requested
   * @memberof AppService
   */
  getVulnerability(id: number) {
    return this.http.get(`${this.api}/vulnerability/${id}`);
  }

  /**
   * Function is responsible for updating a vulnerability by ID
   * @param {number} id is associated with the requested vulnerability
   * @param {FormData} vuln is associated with the form data passed as an object
   * @returns http status code for the return value
   * @memberof AppService
   */
  updateVulnerability(id: number, vuln: FormData) {
    return this.http.patch(`${this.api}/vulnerability/${id}`, vuln);
  }

  /**
   * Function is responsible for creating a vulnerability for an assessment
   * @param {FormData} vuln contains the form object data for all required fields
   * @returns http status code of the request
   * @memberof AppService
   */
  createVuln(vuln: FormData) {
    return this.http.post(`${this.api}/vulnerability`, vuln);
  }

  /**
   * Function is responsible for deletion of a vulnerability
   * @param {number} vulnId is the ID association to the vulnerability
   * @returns http status code of the request
   * @memberof AppService
   */
  deleteVuln(vulnId: number) {
    return this.http.delete(`${this.api}/vulnerability/${vulnId}`);
  }

  /**
   * Function is responsible for creating a new organization
   * @param {Organization} org object of the form data passed to the API
   * @returns http status code of the request
   * @memberof AppService
   */
  createOrg(org: Organization) {
    return this.http.post(`${this.api}/organization`, org);
  }

  /**
   * Function is responsible for updating an organization
   * @param {number} id is the organization ID being updated
   * @param {Organization} org is the form object data passed to the API
   * @returns http status code of the request
   * @memberof AppService
   */
  updateOrg(id: number, org: Organization) {
    return this.http.patch(`${this.api}/organization/${id}`, org);
  }

  /**
   * Function is responsible for creating a new asset tied to an organization
   * @param {Asset} asset is the form object data for the new asset
   * @returns http status code of the request
   * @memberof AppService
   */
  createAsset(asset: Asset) {
    return this.http.post(`${this.api}/organization/${asset.organization}/asset`, asset);
  }

  /**
   * Function is responsible for fetching assets
   * @param {number} assetId asset ID being requested
   * @param {number} orgId associated organization ID attached to the asset
   * @returns https status code of the request
   * @memberof AppService
   */
  getAsset(assetId: number, orgId: number) {
    return this.http.get(`${this.api}/organization/${orgId}/asset/${assetId}`);
  }

  /**
   * Function is responsible for updating an asset
   * @param {Asset} asset is the ID associated to the asset
   * @returns http status code of the request
   * @memberof AppService
   */
  updateAsset(asset: Asset) {
    return this.http.patch(`${this.api}/organization/${asset.organization}/asset/${asset.id}`, asset);
  }

  /**
   * Function is responsible for creating new assessments
   * @param {Assessment} assessment data contained in the assessment form object
   * @returns http status code of the request
   * @memberof AppService
   */
  createAssessment(assessment: Assessment) {
    return this.http.post(`${this.api}/assessment`, assessment);
  }

  /**
   * Function is responsible for updating an assessment's data
   * @param {Assessment} assessment form object data of the assessment
   * @param {number} assessmentId associated ID of the assessment being altered
   * @param {number} assetId asset ID attached to the request ties into the assessment ID
   * @returns http status code of the request
   * @memberof AppService
   */
  updateAssessment(assessment: Assessment, assessmentId: number, assetId: number) {
    return this.http.patch(`${this.api}/asset/${assetId}/assessment/${assessmentId}`, assessment);
  }

  /**
   * Function is responsible for retrevial of assessments
   * @param {number} assetId associated asset ID required
   * @param {number} assessmentId associated assessment ID required
   * @returns http status code with object data from the API call
   * @memberof AppService
   */
  getAssessment(assetId: number, assessmentId: number) {
    return this.http.get(`${this.api}/asset/${assetId}/assessment/${assessmentId}`);
  }

  /**
   * Function is responsible for uploading files, attaching them to the resource requesting it
   * @param {File} fileToUpload form object data for the files associated in the request
   * @returns http status code of the request
   * @memberof AppService
   */
  upload(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload);
    return this.http.post(`${this.api}/upload`, formData);
  }

  /**
   * Function is responsible for uploading multi-part data associated with files.
   * @param {FormData} fileToUpload form object data holding the file objects required
   * @returns http status code of the request
   * @memberof AppService
   */
  uploadMultiple(fileToUpload: FormData) {
    return this.http.post(`${this.api}/upload-multiple`, fileToUpload);
  }

  /**
   * Function is responsible for report retrevial
   * @param {number} assessmentId required ID of the assessment for object data relations
   * @returns http status request and object data for the report
   * @memberof AppService
   */
  getReport(assessmentId: number) {
    return this.http.get(`${this.api}/assessment/${assessmentId}/report`);
  }

  /**
   * Function is responsible for report generation
   * @param {number} orgId requires associated data from the organization ID
   * @param {number} assetId requires associated data from the asset ID
   * @param {number} assessmentId requires associated data from the assessment ID
   * @returns http status code of the request along with a new tab with a generated report
   * @memberof AppService
   */
  generateReport(orgId: number, assetId: number, assessmentId: number) {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    const generateObject = {
      orgId,
      assetId,
      assessmentId
    };
    return this.http.post(`${this.api}/report/generate`, generateObject, httpOptions);
  }

  /**
   * Function is responsible for generating URL's to provide accessable data, reports, images, and
   * any other downloadble content.
   * @param {*} file requires the file object to be called
   * @param {string} [mimetype] requires the mimetype of the data
   * @returns new URL with the object requested in a sanatized manner
   * @memberof AppService
   */
  public createObjectUrl(file, mimetype?: string) {
    // Preview unsaved form
    const blob = new Blob([file], {
      type: mimetype || file.type
    });
    const url = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
