import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, catchError, switchMap } from 'rxjs/operators';
import { LoaderService } from './loader.service';
import { AlertService } from './alert/alert.service';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { Tokens } from './interfaces/Tokens';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(
    public loaderService: LoaderService,
    public alertService: AlertService,
    public authService: AuthService,
    public router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.authService.getUserToken();
    if (authToken) {
      req = req.clone({
        headers: req.headers.set('Authorization', authToken),
      });
    }
    this.loaderService.show();
    return next.handle(req).pipe(
      finalize(() => this.loaderService.hide()),
      catchError((error: any) => {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          if (environment.production) {
            console.error('An error occurred:', error.error.message);
          }
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          if (environment.production) {
            console.error(
              `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`
            );
          }
          switch (error.status) {
            case 500:
              error.error = 'Internal Server Error';
              this.alertService.error(error.error);
              break;
            case 404:
              this.alertService.warn(error.error);
              break;
            case 401:
              const url = environment.apiUrl;
              if (error.url === url + '/refresh') {
                this.logout();
                this.alertService.error(
                  'You have been logged out due to inactivity'
                );
                break;
              }
              return this.authService.refreshSession().pipe(
                switchMap((tokens: Tokens) => {
                  this.authService.setTokens(tokens);
                  req = req.clone({
                    headers: req.headers.set('Authorization', tokens.token),
                  });
                  return next.handle(req);
                })
              );
            case 400:
              this.alertService.warn(error.error);
              break;
            default:
              error.error = 'Internal Server Error';
              this.alertService.error(error.error);
          }
        }
        // return an observable with a user-facing error message
        return [];
      })
    );
  }
}
