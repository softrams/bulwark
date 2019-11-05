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
              })
              .catch((err) => {
                this.handleError(err);
              });
          } else {
            count++;
          }
        }
        if (count === orgs.length) {
          return orgs;
        }
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

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
              })
              .catch((err) => {
                this.handleError(err);
              });
          } else {
            count++;
          }
        }
        if (count === orgs.length) {
          return orgs;
        }
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  getImageById(file: any) {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http
      .get(`${this.api}/file/${file.id}`, httpOptions)
      .toPromise()
      .then((res: Blob) => {
        const blob = new Blob([res], {
          type: file.mimetype
        });
        const url = window.URL.createObjectURL(blob);
        return url;
      });
  }

  getOrganizationById(id: number) {
    return this.http
      .get(`${this.api}/organization/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  getOrganizationAssets(id: number) {
    return this.http
      .get(`${this.api}/organization/asset/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  archiveOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/archive`, null);
  }

  activateOrganization(id: number) {
    return this.http.patch(`${this.api}/organization/${id}/activate`, null);
  }

  getAssessments(id: number) {
    return this.http
      .get(`${this.api}/assessment/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  getVulnerabilities(assessmentId: number) {
    return this.http
      .get(`${this.api}/assessment/${assessmentId}/vulnerability`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  getVulnerability(id: number) {
    return this.http.get(`${this.api}/vulnerability/${id}`);
  }

  updateVulnerability(id: number, vuln: FormData) {
    return this.http.patch(`${this.api}/vulnerability/${id}`, vuln);
  }

  createVuln(vuln: FormData) {
    return this.http.post(`${this.api}/vulnerability`, vuln);
  }

  deleteVuln(vulnId: number) {
    return this.http.delete(`${this.api}/vulnerability/${vulnId}`);
  }

  createOrg(org: Organization) {
    return this.http.post(`${this.api}/organization`, org);
  }

  updateOrg(id: number, org: Organization) {
    return this.http.patch(`${this.api}/organization/${id}`, org);
  }

  createAsset(asset: Asset) {
    return this.http.post(`${this.api}/organization/${asset.organization}/asset`, asset);
  }

  getAsset(assetId: number, orgId: number) {
    return this.http.get(`${this.api}/organization/${orgId}/asset/${assetId}`);
  }

  updateAsset(asset: Asset) {
    return this.http.patch(`${this.api}/organization/${asset.organization}/asset/${asset.id}`, asset);
  }

  createAssessment(assessment: Assessment) {
    return this.http.post(`${this.api}/assessment`, assessment);
  }

  updateAssessment(assessment: Assessment, assessmentId: number, assetId: number) {
    return this.http.patch(`${this.api}/asset/${assetId}/assessment/${assessmentId}`, assessment);
  }

  getAssessment(assetId: number, assessmentId: number) {
    return this.http.get(`${this.api}/asset/${assetId}/assessment/${assessmentId}`);
  }

  upload(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload);
    return this.http.post(`${this.api}/upload`, formData);
  }

  uploadMultiple(fileToUpload: FormData) {
    return this.http.post(`${this.api}/upload-multiple`, fileToUpload);
  }

  getReport(assessmentId: number) {
    return this.http.get(`${this.api}/assessment/${assessmentId}/report`);
  }

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

  public createObjectUrl(file, mimetype?: string) {
    // Preview unsaved form
    const blob = new Blob([file], {
      type: mimetype || file.type
    });
    const url = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return [];
  }
}
