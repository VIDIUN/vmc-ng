import { VidiunUploadFile } from 'app-shared/vmc-shared/upload-management';
import { VidiunMediaType } from 'vidiun-ngx-client';

export class NewEntryFlavourFile extends VidiunUploadFile {
  constructor(file: File, public entryId?: string, public mediaType?: VidiunMediaType) {
    super(file);
  }
}
