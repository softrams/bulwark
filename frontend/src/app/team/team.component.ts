import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../alert/alert.service';
import { Team } from '../interfaces/Team';
import { TeamService } from '../team.service';
import { UserService } from '../user.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass'],
})
export class TeamComponent implements OnInit {
  teams: Team[];
  teamForm: FormGroup;

  constructor(
    public userService: UserService,
    private fb: FormBuilder,
    public alertService: AlertService,
    public teamService: TeamService
  ) {
    this.createForm();
  }
  @ViewChild('teamTable') table: Table;

  ngOnInit(): void {
    this.getTeams();
  }

  getTeams() {
    this.teamService.getTeams().subscribe((teams) => (this.teams = teams));
  }

  createForm() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      organization: ['', [Validators.required]],
      assets: ['', [Validators.required]],
      role: ['', [Validators.required]],
      userIds: ['', [Validators.required]],
    });
  }
  onSubmit(form) {
    const team: Team = {
      name: form.value.name,
      organization: form.value.organization,
      assets: form.value.assets,
      role: form.value.role,
      userIds: form.value.userIds,
    };
    console.log(team);
  }
}
