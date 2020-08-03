import { IssueLinkType } from './jira-issue-link-type.interface';
import { JiraIssue } from './jira-issue.interface';

export interface IssueLink {
  id: number;
  type: IssueLinkType;
  direction: string; // Inward, Outward
  outwardIssue: JiraIssue;
  inwardIssue: JiraIssue;
  linkedIssue: JiraIssue;
}
