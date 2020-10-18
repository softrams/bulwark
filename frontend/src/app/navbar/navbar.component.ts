import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LoaderService } from '../loader.service';
import { AuthService } from '../auth.service';
import { GlobalManagerService } from '../global-manager.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  loggedIn$ = this.globalManager.loggedIn$;
  menuItems: MenuItem[];

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    private globalManager: GlobalManagerService
  ) { }

  ngOnInit() {
    this.initMenuItems();
  }

  initMenuItems() {
    this.menuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        routerLink: ['user/profile']
      },
      {
        label: 'Invite User',
        icon: 'pi pi-fw pi-plus',
        routerLink: ['invite']
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-sliders-h',
        routerLink: ['settings']
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-power-off',
        command: this.logout
      }
    ];
  }

  logout() {
    this.authService.logout();
  }
}
