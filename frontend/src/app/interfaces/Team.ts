import { Organization } from '../org-form/Organization';

export interface Team {
  teamId?: number;
  name: string;
  organization: Organization;
  assetIds: number[];
  role: string;
  userIds: number[];
}
