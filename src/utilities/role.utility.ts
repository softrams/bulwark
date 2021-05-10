import { ROLE } from '../enums/roles-enum';
import { UserRequest } from '../interfaces/user-request.interface';

export const hasOrgAccess = (req: UserRequest, rqstdOrgId: number) => {
  if (req.userOrgs && req.userOrgs.length) {
    return req.userOrgs.includes(rqstdOrgId);
  } else {
    return false;
  }
};

export const hasAssetReadAccess = (req: UserRequest, assetId: number) => {
  return req.userAssets.includes(assetId);
};

export const hasAssetWriteAccess = (req: UserRequest, assetId: number) => {
  if (req.isAdmin) {
    return true;
  }
  const testerTeams = req.userTeams.filter((team) => team.role === ROLE.TESTER);
  if (testerTeams && testerTeams.length) {
    for (const testerTeam of testerTeams) {
      for (const asset of testerTeam.assets) {
        if (asset.id === assetId) {
          return true;
        }
      }
    }
  } else {
    return false;
  }
};
