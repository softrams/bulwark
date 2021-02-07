import { Component, OnInit, OnChanges } from '@angular/core';
import { ROLE } from '../enums/roles.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../team.service';
import { AlertService } from '../alert/alert.service';
import { Team } from '../interfaces/Team';
import { Organization } from '../org-form/Organization';
import { ActivatedRoute, Router } from '@angular/router';
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
export class TeamFormComponent implements OnInit, OnChanges {
  roles: Role[];
  teamForm: FormGroup;
  organizations: Organization[];
  assets: Asset[];
  activeUsers: User[];
  teamModel: Team;
  isCreate = true;
  teamId: number;
  constructor(
    private fb: FormBuilder,
    public alertService: AlertService,
    public teamService: TeamService,
    public appService: AppService,
    public activatedRoute: ActivatedRoute,
    public route: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ result }) => {
      this.organizations = result.organizations;
      this.activeUsers = result.activeUsers;
      this.appService
        .getOrganizationAssets(this.organizations[0].id)
        .then((assets: Asset[]) => {
          // tslint:disable-next-line: no-string-literal
          this.teamForm.controls['organization'].setValue(
            this.organizations[0]
          );
          this.assets = assets;
        });
      this.activatedRoute.params.subscribe((param) => {
        if (param && param.teamId) {
          this.isCreate = false;
          this.teamId = param.teamId;
          this.teamService.getTeamById(param.teamId).subscribe((team: Team) => {
            const role: Role = {
              name: team.role,
            };
            team.role = role;
            this.teamForm.patchValue(team);
            if (team.organization) {
              this.appService
                .getOrganizationAssets(team.organization.id)
                .then((assets: Asset[]) => {
                  this.assets = assets;
                });
            }
          });
        }
      });
    });
    this.roles = [
      { name: ROLE.READONLY },
      { name: ROLE.TESTER },
      { name: ROLE.ADMIN },
    ];
  }

  ngOnChanges() {
    this.rebuildForm();
  }

  createForm() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      role: ['', [Validators.required]],
      users: [''],
      assets: [''],
      organization: [''],
    });
  }

  rebuildForm() {
    this.teamForm.reset({
      name: this.teamModel.name,
      role: this.teamModel.role,
      users: this.teamModel.users,
      assets: this.teamModel.assets,
      organization: this.teamModel.organization,
    });
  }

  onSubmit(form) {
    if (form.value.users) {
      form.value.users = form.value.users.map((x) => x.id);
    }
    if (form.value.assets) {
      form.value.assets = form.value.assets.map((x) => x.id);
    }
    const team: Team = {
      name: form.value.name,
      organization: form.value.organization,
      role: form.value.role.name,
      users: form.value.users,
      assetIds: form.value.assets,
    };
    if (this.isCreate) {
      this.teamService.createTeam(team).subscribe((res: string) => {
        this.teamForm.reset();
        this.route.navigate([`administration`]);
        this.alertService.success(res);
      });
    } else {
      team.id = this.teamId;
      this.teamService.updateTeam(team).subscribe((res: string) => {
        this.teamForm.reset();
        this.route.navigate([`administration`]);
        this.alertService.success(res);
      });
    }
  }

  navigateToAdministration() {
    this.route.navigate([`administration`]);
  }

  fetchOrgAssets(event) {
    const orgId: number = event.id;
    this.appService.getOrganizationAssets(orgId).then((assets: Asset[]) => {
      this.assets = assets;
    });
  }
}
