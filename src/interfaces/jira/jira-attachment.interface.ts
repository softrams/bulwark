import { JiraUser } from './jira-user.interface';

export interface Attachment {
  id: number;
  author: JiraUser;
  filename: string;
  size: number;
  mimeType: string;
  created: Date;
}
