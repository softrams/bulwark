import { Url } from 'url';

export class Assessment {
  constructor(
    public id: number,
    public name: string,
    public executiveSummary: string,
    public asset: number,
    public jiraId: string,
    public testUrl: Url,
    public prodUrl: Url,
    public scope: string,
    public tag: number,
    public startDate: Date,
    public endDate: Date
  ) {}
}
