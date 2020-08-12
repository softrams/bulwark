import { JiraProject } from './jira-project.interface';
import { JiraPriority } from './jira-issue-priority.interface';
import { IssueType } from './jira-issue-type.interface';
import { IssueStatus } from './jira-issue-status.interface';
import { IssueLink } from './jira-issue-link.interface';
// Add interfaces as you need them
export interface JiraIssue {
  update?: object;
  fields: {
    id?: number;
    key?: string;
    summary?: string;
    parent?: {
      key: string;
    };
    subtasks?: JiraIssue[];
    description?: any;
    environment?: string;
    project?: JiraProject;
    priority?: JiraPriority;
    assignee?: any;
    reporter?: any;
    creator?: any;
    issuetype?: IssueType;
    issueStatus?: IssueStatus;
    created?: Date;
    updated?: Date;
    dueDate?: Date;
    resolution?: any;
    originalEstimate?: number;
    remainingEstimate?: number;
    timeSpent?: number;
    securityLevel?: any;
    labels?: string[];
    versions?: any[];
    fixVersions?: any[];
    components?: [];
    comments?: Comment[];
    attachments?: [];
    links?: IssueLink[];
    properties?: any;
  };
}
