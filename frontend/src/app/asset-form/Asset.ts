export class Asset {
  constructor(
    public id: number,
    public name: string,
    public organization: number,
    public jiraUsername: string,
    public jiraHost: string,
    public jiraApiKey: string
  ) {}
}
