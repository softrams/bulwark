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

  getTeamById(id: number) {
    return this.http.get<Team[]>(`${this.api}/team/${id}`);
  }
}
