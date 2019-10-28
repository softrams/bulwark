import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { Assessment } from '../entity/Assessment';
import { Vulnerability } from '../entity/Vulnerability';

export class Report {
  org: Organization;
  asset: Asset;
  assessment: Assessment;
  vulns: Vulnerability[];
}
