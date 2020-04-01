import { Request } from 'express';
import { File } from '../entity/File';

export interface UserRequest extends Request {
  user: string;
  fileExtError: string;
  file: File;
  files: File[];
}
