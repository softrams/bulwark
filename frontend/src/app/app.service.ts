import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Organization } from './org-form/Organization';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) {}
  api = 'http://localhost:5000/api';

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
              .get(`${this.api}/organization/file/${orgs[i].avatar.id}`, httpOptions)
              .toPromise()
              .then(async (res: Blob) => {
                const blob = new Blob([res], {
                  type: orgs[i].avatar.mimetype
                });
                const url = window.URL.createObjectURL(blob);
                orgs[i].imgUrl = url;
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

  createOrg(org: Organization) {
    return this.http.post(`${this.api}/organization`, org);
  }

  upload(fileToUpload: File) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload);
    return this.http.post(`${this.api}/upload`, formData);
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
