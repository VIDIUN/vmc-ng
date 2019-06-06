import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunBulkUploadObjectType } from 'vidiun-ngx-client';

@Pipe({ name: 'vBulkLogTableObjectType' })

export class BulkLogObjectTypePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: VidiunBulkUploadObjectType): string {
    switch (true) {
      case VidiunBulkUploadObjectType.category === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.category');

      case VidiunBulkUploadObjectType.categoryUser === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.categoryUser');

      case VidiunBulkUploadObjectType.entry === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.entry');

      case VidiunBulkUploadObjectType.user === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.user');

      default:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.other');
    }
  }
}
