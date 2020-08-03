import { StatusCategory } from './jira-status-category.interface';
export interface IssueStatus {
  id: number;
  name: string;
  description: string;
  category: StatusCategory;
}
