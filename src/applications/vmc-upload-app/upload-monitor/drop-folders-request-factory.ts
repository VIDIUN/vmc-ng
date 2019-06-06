import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { RequestFactory } from '@vidiun-ng/vidiun-common';
import { DropFolderFileListAction } from 'vidiun-ngx-client';
import { VidiunDropFolderFileListResponse } from 'vidiun-ngx-client';
import { VidiunDropFolderFileFilter } from 'vidiun-ngx-client';

export class DropFoldersRequestFactory implements RequestFactory<DropFolderFileListAction, VidiunDropFolderFileListResponse> {
  public uploadedOn: Date;
  public dropFolderIdIn: string;

  constructor() {
  }

  create(): DropFolderFileListAction {
    if (this.uploadedOn === null || this.dropFolderIdIn === null) {
      return null;
    }

    return new DropFolderFileListAction({
      filter: new VidiunDropFolderFileFilter({
        createdAtGreaterThanOrEqual: this.uploadedOn,
        dropFolderIdIn: this.dropFolderIdIn
      })
    }).setRequestOptions({
        responseProfile: new VidiunDetachedResponseProfile({
          type: VidiunResponseProfileType.includeFields,
          fields: 'id,status,createdAt'
      })
    });
  }
}
