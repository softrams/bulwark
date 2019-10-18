import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Organization } from './org-form/Organization';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) {}
  api = 'http://localhost:5000/api';

  getOrganizations() {
    return this.http
      .get(`${this.api}/organization`)
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

  getAssessments(id: number) {
    return this.http
      .get(`${this.api}/assessment/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  getVulnerabilities(id: number) {
    return this.http
      .get(`${this.api}/vulnerabilities/${id}`)
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  submitOrgForm(orgForm: any) {
    return this.http.post(`${this.api}/organization`, orgForm);
  }

  uploadOrgImage(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('orgAvatar', fileToUpload);
    return this.http.post(`${this.api}/organization/upload`, formData);
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
