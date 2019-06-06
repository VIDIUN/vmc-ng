import { VidiunUploadFile } from 'app-shared/vmc-shared';

export class NewEntryRelatedFile extends VidiunUploadFile {
  public assetId?: string;
  constructor(file: File) {
    super(file);
  }
}
