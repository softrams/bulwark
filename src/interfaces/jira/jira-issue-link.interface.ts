export interface IssueLink {
  id?: number;
  outwardIssue?: {
    key: string;
  };
  inwardIssue?: {
    key: string;
  };
  type?: {
    name: string;
  };
}
