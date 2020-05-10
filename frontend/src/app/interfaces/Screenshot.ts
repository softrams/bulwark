import { SafeUrl } from '@angular/platform-browser';

export interface Screenshot {
    url: SafeUrl;
    file: any;
    fileName: string;
    fileId: number;
}
