import { Component, OnInit } from '@angular/core';
import { ROLE } from '../enums/roles.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../team.service';
import { AlertService } from '../alert/alert.service';
import { Team } from '../interfaces/Team';
import { Organization } from '../org-form/Organization';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
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
    this.activatedRoute.data.subscribe(({ organizations }) => {
      this.organizations = organizations;
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
    const team: Team = {
      name: form.value.name,
      organization: form.value.organization,
      role: form.value.role,
      userIds: form.value.userIds,
      assetIds: form.value.assetIds,
    };
    console.log(team);
  }

  fetchOrgAssets(event) {
    let orgId: number = event.id;
    this.appService
      .getOrganizationAssets(orgId)
      .then((assets) => console.log(assets));
  }
}
