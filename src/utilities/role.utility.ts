// create function that takes an Org ID or Asset ID, and checks against the user teams to determine role

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
