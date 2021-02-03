import { Organization } from '../org-form/Organization';
import { Asset } from '../asset-form/Asset';
interface Role {
  name: string;
}
export interface Team {
  id?: number;
  name: string;
  organization: Organization;
  assets?: Asset[];
  assetIds?: number[];
  role: any;
  users: number[];
}
