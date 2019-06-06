import { UploadFileData } from '@vidiun-ng/vidiun-common';
import 'rxjs/add/observable/throw';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export class VidiunUploadFile implements UploadFileData {
  serverUploadToken: string;


  constructor(public file: File) {
  }

  getFileName(): string {
    return (this.file.name || '').trim();
  }

  getFileSize(): number {
    return this.file.size;
  }
}


