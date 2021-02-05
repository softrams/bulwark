import { Organization } from '../entity/Organization';

export interface TeamInfo {
  id: number;
  role: string;
  organization: Organization;
  asset: number;
}
