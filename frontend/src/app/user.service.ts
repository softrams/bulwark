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

  getUsers() {
    return this.http.get<User[]>(`${this.api}/users`);
  }
  getTesters(orgId: number) {
    return this.http.get<User[]>(`${this.api}/testers/${orgId}`);
  }
  getAllUsers() {
    return this.http.get<User[]>(`${this.api}/users/all`);
  }
  patchUser(user: User) {
    return this.http.patch(`${this.api}/user`, user);
  }
  createUser(user: User) {
    return this.http.post(`${this.api}/user`, user);
  }
  /**
   * Activate a user (admin)
   * @param id user ID
   */
  activateUser(id: string | number) {
    return this.http.patch(`${this.api}/user/activate/${id}`, {});
  }
  /**
   * Deactivate a user (admin)
   * @param id user ID
   */
  deactivateUser(id: string | number) {
    return this.http.patch(`${this.api}/user/deactivate/${id}`, {});
  }
}
