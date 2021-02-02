import { Component, OnInit } from '@angular/core';
import { ROLE } from '../enums/roles.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../team.service';
import { AlertService } from '../alert/alert.service';
import { Team } from '../interfaces/Team';
import { Organization } from '../org-form/Organization';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
import { Asset } from '../asset-form/Asset';
import { User } from '../interfaces/User';
interface Role {
  name: string;
}
@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.sass'],
})
export class TeamFormComponent implements OnInit {
  roles: Role[];
  teamForm: FormGroup;
  organizations: Organization[];
  assets: Asset[];
  activeUsers: User[];
  constructor(
    private fb: FormBuilder,
    public alertService: AlertService,
    public teamService: TeamService,
    public appService: AppService,
    public activatedRoute: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ result }) => {
      this.organizations = result.organizations;
      this.activeUsers = result.activeUsers;
      console.log(this.activeUsers);
    });
    this.roles = [
      { name: ROLE.ADMIN },
      { name: ROLE.TESTER },
      { name: ROLE.READONLY },
    ];
  }

  createForm() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      role: ['', [Validators.required]],
      userIds: [''],
      assetIds: [''],
      organization: ['', [Validators.required]],
    });
  }

  onSubmit(form) {
    if (form.value.userIds) {
      form.value.userIds = form.value.userIds.map((x) => x.id);
    }
    if (form.value.assetIds) {
      form.value.assetIds = form.value.assetIds.map((x) => x.id);
    }
    const team: Team = {
      name: form.value.name,
      organization: form.value.organization,
      role: form.value.role.name,
      userIds: form.value.userIds,
      assetIds: form.value.assetIds,
    };
    this.teamService.createTeam(team).subscribe((res: string) => {
      this.alertService.success(res);
    });
  }

  fetchOrgAssets(event) {
    let orgId: number = event.id;
    this.appService.getOrganizationAssets(orgId).then((assets: Asset[]) => {
      this.assets = assets;
      console.log(this.assets);
    });
  }
}
