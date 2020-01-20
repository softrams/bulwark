import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { LoaderService } from './loader.service';
import { AlertService } from './alert/alert.service';
import { environment } from '../environments/environment';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(
    public loaderService: LoaderService,
    public alertService: AlertService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
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
              this.alertService.error(error.error);
              break;
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
