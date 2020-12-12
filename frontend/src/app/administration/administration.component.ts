import { Component, OnInit } from '@angular/core';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { SettingsComponent } from './settings/settings.component';


@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.sass']
})
export class AdministrationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
