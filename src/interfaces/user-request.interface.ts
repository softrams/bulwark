import { Request } from 'express';
import { File } from '../entity/File';
import { TeamInfo } from './team-info.interface';

export interface UserRequest extends Request {
  user: string;
  organization: number[];
  assets: number[];
  fileExtError: string;
  file: File;
  files: File[];
  isAdmin: boolean;
}
