import { Jira } from './Jira';

export interface Asset {
  id: number;
  name: string;
  organization: number;
  jira?: Jira;
}
