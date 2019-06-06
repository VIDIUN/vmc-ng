import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { XInternalXAddBulkDownloadAction } from './XInternalXAddBulkDownloadAction';
import { AppLocalization } from '@vidiun-ng/mc-shared';

export class BulkDownloadError extends Error {
  type = 'bulkDownload';

  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class BulkDownloadService extends BulkActionBaseService<number> {

  constructor(_vidiunServerClient: VidiunClient, private _appLocalization: AppLocalization) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], flavorId: number) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: XInternalXAddBulkDownloadAction[] = [];
      let entryIds = "";

      selectedEntries.forEach(entry => {
        entryIds += entry.id +",";
      });
      if (entryIds.lastIndexOf(",") === entryIds.length - 1) {
        entryIds = entryIds.substr(0, entryIds.length - 1); // remove last comma
      }

      this._vidiunServerClient.request(new XInternalXAddBulkDownloadAction({
        entryIds: entryIds,
        flavorParamsId: flavorId.toString()
      })).subscribe(
          result => {
            observer.next({'email': result})
            observer.complete();
          },
          error => {
            observer.error(new BulkDownloadError(this._appLocalization.get('applications.content.bulkActions.downloadFailed')));
          }
      );
    });
  }

}
