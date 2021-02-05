import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Team } from './interfaces/Team';
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getTeams() {
    return this.http.get<Team[]>(`${this.api}/team`);
  }

  getTeamById(teamId: number) {
    return this.http.get<Team>(`${this.api}/team/${teamId}`);
  }

  createTeam(team: Team) {
    return this.http.post(`${this.api}/team`, team);
  }

  updateTeam(team: Team) {
    return this.http.patch(`${this.api}/team`, team);
  }

  deleteTeam(teamId: number) {
    return this.http.delete(`${this.api}/team/${teamId}`);
  }
}
