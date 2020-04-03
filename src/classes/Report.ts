import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { Assessment } from '../entity/Assessment';
import { Vulnerability } from '../entity/Vulnerability';

export class Report {
  public org: Organization;
  public asset: Asset;
  public assessment: Assessment;
  public vulns: Vulnerability[];
}
