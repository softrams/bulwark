// create function that takes an Org ID or Asset ID, and checks against the user teams to determine role

import { ROLE } from '../enums/roles-enum';
import { UserRequest } from '../interfaces/user-request.interface';

export const fetchRole = (
  req: UserRequest,
  orgId?: number,
  assetId?: number
) => {
  if (orgId) {
    for (const team of req.userTeams) {
      if (team.organization) {
        if (team.organization.id === orgId) {
          return team.role;
        }
      }
    }
  }
};

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
