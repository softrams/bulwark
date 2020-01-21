import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { GlobalManagerService } from './global-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private globalManager: GlobalManagerService,
    private router: Router
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
      return true;
    } else {
      // Navigate to the login page with extras
      this.router.navigate(['/login']);
      this.globalManager.showLogin(false);
      return false;
    }
  }
}
