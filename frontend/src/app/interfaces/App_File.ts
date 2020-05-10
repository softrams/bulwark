import { SafeUrl } from '@angular/platform-browser';

export interface AppFile extends File {
  id: number;
  buffer: any;
  encoding: string;
  fieldName: string;
  mimetype: string;
  originalname: string;
  size: number;
  imgUrl: SafeUrl;
}
