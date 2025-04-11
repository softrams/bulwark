import { URL } from 'url';
import { User } from '../interfaces/User';

export class Assessment {
  constructor(
    public id: number,
    public name: string,
    public executiveSummary: string,
    public asset: number,
    public jiraId: string,
    public testUrl: URL,
    public prodUrl: URL,
    public scope: string,
    public tag: number,
    public startDate: Date,
    public endDate: Date,
    public testers: User[]
  ) {}
}