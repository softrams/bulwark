import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  api = environment.apiUrl;
  isLoggedIn = false;

  login(creds) {
    return this.http.post(`${this.api}/login`, creds);
  }

  logout() {
    localStorage.removeItem('REFRESH_TOKEN');
    return localStorage.removeItem('AUTH_TOKEN');
  }

  getUserToken() {
    return localStorage.getItem('AUTH_TOKEN');
  }

  getRefreshToken() {
    return localStorage.getItem('REFRESH_TOKEN');
  }

  forgotPassword(email) {
    return this.http.patch(`${this.api}/forgot-password`, email);
  }

  passwordReset(creds) {
    return this.http.patch(`${this.api}/password-reset`, creds);
  }

  refreshSession(refreshToken) {
    return this.http.post(`${this.api}/refresh`, { refreshToken });
  }
}
