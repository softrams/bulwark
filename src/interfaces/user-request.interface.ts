import { Request } from 'express';
import { Team } from '../entity/Team';
import { File } from '../entity/File';
export interface UserRequest extends Request {
  user: string;
  fileExtError: string;
  file: File;
  files: File[];
  isAdmin: boolean;
  userTeams: Team[];
  userOrgs: number[];
  userAssets: number[];
}
