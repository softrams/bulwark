// create function that takes an Org ID or Asset ID, and checks against the user teams to determine role

import { Assessment } from '../entity/Assessment';
import { getConnection } from 'typeorm';
import { ROLE } from '../enums/roles-enum';
import { UserRequest } from '../interfaces/user-request.interface';

export const hasOrgAccess = (req: UserRequest, rqstdOrgId: number) => {
  if (req.userOrgs && req.userOrgs.length) {
    return req.userOrgs.includes(rqstdOrgId);
  } else {
    return false;
  }
};

export const hasAssetAccess = (req: UserRequest, rqstdAssetId: number) => {
  return req.userAssets.includes(rqstdAssetId);
};

export const hasTesterAssetAccess = (req: UserRequest, orgId: number) => {
  if (req.isAdmin) {
    return true;
  }
  const testerTeams = req.userTeams.filter((team) => team.role === ROLE.TESTER);
  if (testerTeams && testerTeams.length) {
    const testerTeamIds = testerTeams.map(
      (testerTeam) => testerTeam.organization.id
    );
    return testerTeamIds.includes(orgId);
  } else {
    return false;
  }
};

export const hasAssessmentAccess = async (
  req: UserRequest,
  assessmentId: number
) => {
  if (req.isAdmin) {
    return true;
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.asset', 'asset')
    .leftJoinAndSelect('asset.organization', 'organization')
    .select(['assessment', 'asset', 'organization'])
    .where('assessment.id = :assessmentId', { assessmentId })
    .getOne();
  const orgId = assessment.asset.organization.id;
  const allowedTeams = req.userTeams.filter(
    (team) => team.role === ROLE.TESTER || team.role === ROLE.ADMIN
  );
  if (allowedTeams && allowedTeams.length) {
    const allowedOrgIds = allowedTeams.map(
      (allowedTeam) => allowedTeam.organization.id
    );
    return allowedOrgIds.includes(orgId);
  } else {
    return false;
  }
};
