import { ROLE } from '../enums/roles-enum';
import { UserRequest } from '../interfaces/user-request.interface';

/**
 * @description Check if user has access to an organization
 * @param {UserRequest} req
 * @param {number} rqstdOrgId
 * @returns boolean
 */
export const hasOrgAccess = (req: UserRequest, rqstdOrgId: number): boolean => {
  if (!req.userOrgs || !req.userOrgs.length) {
    return false;
  }
  
  return req.userOrgs.includes(rqstdOrgId);
};

/**
 * @description Check if user has read access to an asset
 * @param {UserRequest} req
 * @param {number} assetId
 * @returns Promise<boolean>
 */
export const hasAssetReadAccess = async (req: UserRequest, assetId: number): Promise<boolean> => {
  // Ensure we have userAssets array
  if (!req.userAssets) {
    return false;
  }
  
  return req.userAssets.includes(assetId);
};

/**
 * @description Check if user has write access to an asset
 * @param {UserRequest} req
 * @param {number} assetId
 * @returns Promise<boolean>
 */
export const hasAssetWriteAccess = async (req: UserRequest, assetId: number): Promise<boolean> => {
  // Admins have write access to all assets
  if (req.isAdmin) {
    return true;
  }
  
  // If user is not an admin, check if they belong to a tester team with access to this asset
  if (!req.userTeams || !req.userTeams.length) {
    return false;
  }
  
  const testerTeams = req.userTeams.filter((team) => team.role === ROLE.TESTER);
  
  if (!testerTeams || !testerTeams.length) {
    return false;
  }
  
  // Check if any of the user's tester teams have access to this asset
  for (const testerTeam of testerTeams) {
    if (!testerTeam.assets || !testerTeam.assets.length) {
      continue;
    }
    
    for (const asset of testerTeam.assets) {
      if (asset.id === assetId) {
        return true;
      }
    }
  }
  
  return false;
};