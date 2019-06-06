import { VidiunUploadFile } from 'app-shared/vmc-shared';

export class NewEntryCaptionFile extends VidiunUploadFile {
  public captionId?: string;
  constructor(file: File) {
    super(file);
  }
}
