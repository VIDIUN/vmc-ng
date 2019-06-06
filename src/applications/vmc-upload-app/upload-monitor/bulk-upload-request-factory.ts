import { VidiunBulkUploadObjectType } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { VidiunBulkUploadFilter } from 'vidiun-ngx-client';
import { BulkListAction } from 'vidiun-ngx-client';
import { RequestFactory } from '@vidiun-ng/vidiun-common';
import { VidiunBulkUploadListResponse } from 'vidiun-ngx-client';

export class BulkUploadRequestFactory implements RequestFactory<BulkListAction, VidiunBulkUploadListResponse> {

  public uploadedOn: Date;

  constructor() {
  }

  create(): BulkListAction {
    const bulkUploadObjectTypeIn = [
      VidiunBulkUploadObjectType.entry,
      VidiunBulkUploadObjectType.category,
      VidiunBulkUploadObjectType.user,
      VidiunBulkUploadObjectType.categoryUser
    ];

    if (this.uploadedOn === null) {
      return null;
    } else {
      return new BulkListAction({
        bulkUploadFilter: new VidiunBulkUploadFilter({
          bulkUploadObjectTypeIn: bulkUploadObjectTypeIn.join(','),
          uploadedOnGreaterThanOrEqual: this.uploadedOn
        })
      }).setRequestOptions({
          responseProfile: new VidiunDetachedResponseProfile({
              type: VidiunResponseProfileType.includeFields,
              fields: 'id,status,uploadedOn'
          })
      });
    }
  }
}
