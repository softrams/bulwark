import { JiraUser } from './jira-user.interface';

export interface Comment {
  id: number;
  body: string;
  author: JiraUser;
  created: Date;
  updated: Date;
  properties: any;
}
