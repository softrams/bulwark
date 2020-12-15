import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { GlobalManagerService } from './global-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private globalManager: GlobalManagerService,
    private router: Router,
    private authService: AuthService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkLogin();
  }

  checkLogin(): boolean {
    if (localStorage.getItem('AUTH_TOKEN')) {
      this.globalManager.showLogin(true);
      if (this.authService.isAdmin()) {
        return true;
      } else {
        return false;
      }
    } else {
      // Navigate to the login page with extras
      this.router.navigate(['/login']);
      this.globalManager.showLogin(false);
      return false;
    }
  }
}
