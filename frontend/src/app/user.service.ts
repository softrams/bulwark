import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  registerUser(creds) {
    return this.http.post(`${this.api}/user/register`, creds);
  }

  inviteUser(email) {
    return this.http.post(`${this.api}/user/invite`, email);
  }
}
