import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { User } from './interfaces/User';
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

  getUser() {
    return this.http.get<User>(`${this.api}/user`);
  }

  patchUser(user: User) {
    return this.http.patch(`${this.api}/user`, user);
  }
}
