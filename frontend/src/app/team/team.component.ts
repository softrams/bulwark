import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '../alert/alert.service';
import { Team } from '../interfaces/Team';
import { TeamService } from '../team.service';
import { UserService } from '../user.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass'],
})
export class TeamComponent implements OnInit {
  teams: Team[];

  constructor(
    public userService: UserService,
    public alertService: AlertService,
    public teamService: TeamService,
    public router: Router
  ) {}
  @ViewChild('teamTable') table: Table;

  ngOnInit(): void {
    this.getTeams();
  }

  getTeams() {
    this.teamService.getTeams().subscribe((teams) => (this.teams = teams));
  }
  navigateToTeamCreateForm() {
    this.router.navigate([`administration/team`]);
  }

  deleteTeam(team: Team) {
    const r = confirm(`Delete the team "${team.name}"`);
    if (r) {
      this.teamService.deleteTeam(team.id).subscribe((res: string) => {
        this.alertService.success(res);
        this.getTeams();
      });
    }
  }

  navigateToTeam(team: Team) {
    this.router.navigate([`administration/team/${team.id}`]);
  }
}
