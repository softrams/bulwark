import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Tokens } from './interfaces/Tokens';
import jwt_decode from 'jwt-decode';
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
    localStorage.removeItem('AUTH_TOKEN');
  }

  setTokens(tokens: Tokens) {
    localStorage.setItem('AUTH_TOKEN', tokens.token);
    localStorage.setItem('REFRESH_TOKEN', tokens.refreshToken);
  }

  getUserToken() {
    return localStorage.getItem('AUTH_TOKEN');
  }

  getUserFromToken() {
    return jwt_decode(localStorage.getItem('AUTH_TOKEN'));
  }

  isAdmin() {
    const token = this.getUserFromToken();
    let found = false;
    // tslint:disable-next-line: no-string-literal
    found = token['admin'];
    return found;
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

  updatePassword(
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) {
    return this.http.patch(`${this.api}/user/password`, {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
  }

  updateUserEmail(email: string, newEmail: string) {
    return this.http.post(`${this.api}/user/email`, {
      email,
      newEmail,
    });
  }

  validateUserEmailRequest(password: string, uuid: string) {
    return this.http.post(`${this.api}/user/email/validate`, {
      password,
      uuid,
    });
  }

  revokeUserEmail() {
    return this.http.post(`${this.api}/user/email/revoke`, null);
  }

  refreshSession() {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.api}/refresh`, { refreshToken });
  }
}
