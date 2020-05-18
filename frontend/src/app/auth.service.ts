import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Tokens } from './interfaces/Tokens';

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

  getRefreshToken() {
    return localStorage.getItem('REFRESH_TOKEN');
  }

  forgotPassword(email) {
    return this.http.patch(`${this.api}/forgot-password`, email);
  }

  passwordReset(creds) {
    return this.http.patch(`${this.api}/password-reset`, creds);
  }

  refreshSession() {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.api}/refresh`, { refreshToken });
  }
}
