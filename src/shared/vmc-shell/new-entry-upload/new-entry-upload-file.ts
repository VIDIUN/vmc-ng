import { VidiunUploadFile } from 'app-shared/vmc-shared/upload-management/vidiun-upload-file';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { ISubscription } from 'rxjs/Subscription';

export class NewEntryUploadFile extends VidiunUploadFile {
  public entryId: string;
  public createMediaEntrySubscription: ISubscription;
  constructor(file: File,
              public mediaType: VidiunMediaType,
              public transcodingProfileId: number,
              public entryName: string = file.name) {
    super(file);
  }
}
