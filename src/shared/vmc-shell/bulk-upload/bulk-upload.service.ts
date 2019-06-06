import { Injectable } from '@angular/core';
import { VidiunClient } from 'vidiun-ngx-client';
import { BulkUploadAddAction } from 'vidiun-ngx-client';
import { VidiunBulkUploadType } from 'vidiun-ngx-client';
import { VidiunBulkUploadCsvJobData } from 'vidiun-ngx-client';
import { CategoryAddFromBulkUploadAction } from 'vidiun-ngx-client';
import { VidiunBulkUploadCategoryData } from 'vidiun-ngx-client';
import { VidiunBulkUploadUserData } from 'vidiun-ngx-client';
import { VidiunBulkUploadCategoryUserData } from 'vidiun-ngx-client';
import { UserAddFromBulkUploadAction } from 'vidiun-ngx-client';
import { CategoryUserAddFromBulkUploadAction } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { VidiunBulkUpload } from 'vidiun-ngx-client';

export enum BulkUploadTypes {
  entries,
  categories,
  endUsers,
  endUsersEntitlement
}

@Injectable()
export class BulkUploadService {
  constructor(private _vidiunServerClient: VidiunClient) {
  }

  private _getVidiunBulkUploadType(file: File): VidiunBulkUploadType {
    const extension = /(?:\.([^.]+))?$/.exec(file.name)[1];
    return 'csv' === extension ? VidiunBulkUploadType.csv : VidiunBulkUploadType.xml;
  }

  private _getVidiunActionByType(fileData: File, type: BulkUploadTypes): BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction {

    const bulkUploadData = new VidiunBulkUploadCsvJobData();
    bulkUploadData.fileName = fileData.name;

    switch (type) {
      case BulkUploadTypes.entries:
        return new BulkUploadAddAction({
          conversionProfileId: -1,
          csvFileData: fileData,
          bulkUploadType: this._getVidiunBulkUploadType(fileData)
        });
      case BulkUploadTypes.categories:
        return new CategoryAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryData: new VidiunBulkUploadCategoryData()
        });
      case BulkUploadTypes.endUsers:
        return new UserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadUserData: new VidiunBulkUploadUserData()
        });
      case BulkUploadTypes.endUsersEntitlement:
        return new CategoryUserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryUserData: new VidiunBulkUploadCategoryUserData()
        });
      default:
        return null;
    }
  }

  private _getAction(files: File[], type: BulkUploadTypes): (BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction)[] {
    return files
      .map(file => this._getVidiunActionByType(file, type))
      .filter(Boolean);
  }

  public upload(files: FileList, type: BulkUploadTypes): Observable<VidiunBulkUpload> {
    const actions = this._getAction(Array.from(files), type);

    return Observable.from(actions)
      .flatMap(action => this._vidiunServerClient.request(action));
  }
}
