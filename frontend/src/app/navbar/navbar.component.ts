import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LoaderService } from '../loader.service';
import { AuthService } from '../auth.service';
import { GlobalManagerService } from '../global-manager.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  loggedIn$ = this.globalManager.loggedIn$;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    private globalManager: GlobalManagerService
  ) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}
