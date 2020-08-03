export interface JiraUser {
  accountId: string;
  displayName: string;
  properties: any;
  groups: string[];
  permissions: string[];
}
