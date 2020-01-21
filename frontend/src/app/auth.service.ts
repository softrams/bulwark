import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { GlobalManagerService } from './global-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private globalManager: GlobalManagerService
  ) {}

  api = environment.apiUrl;
  isLoggedIn = false;

  login(creds) {
    return this.http.post(`${this.api}/login`, creds);
  }

  logout() {
    return localStorage.removeItem('AUTH_TOKEN');
  }

  getUserToken() {
    return localStorage.getItem('AUTH_TOKEN');
  }
}
