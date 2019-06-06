import { VidiunUploadFile } from 'app-shared/vmc-shared/upload-management/vidiun-upload-file';
import { ISubscription } from 'rxjs/Subscription';

export class NewReplaceVideoUploadFile extends VidiunUploadFile {
    public createMediaEntrySubscription: ISubscription;

    constructor(file: File,
                public assetParamsId: number,
                public transcodingProfileId: number,
                public entryId: string) {
        super(file);
    }
}
