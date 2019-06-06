import { Injectable } from '@angular/core';
import { Observable, throwError as ObservableThrowError } from 'rxjs';
import { map } from 'rxjs/operators';
import { VidiunClient, BaseEntryDeleteAction } from 'vidiun-ngx-client';
import { XInternalXAddBulkDownloadAction } from './entries/bulk-actions/services/XInternalXAddBulkDownloadAction';

@Injectable()
export class ContentEntriesAppService {
  constructor(private _vidiunServerClient: VidiunClient) {

  }

  public deleteEntry(entryId: string): Observable<void> {
      if (!entryId) {
          return ObservableThrowError('missing entryId argument');
      }
      return this._vidiunServerClient
          .request(new BaseEntryDeleteAction({ entryId: entryId }))
          .pipe(map(() => {}));
  }

  public downloadEntry(entryIds: string, flavorParamsId: string): Observable<{ email: string }> {
      return this._vidiunServerClient
          .request(new XInternalXAddBulkDownloadAction({ entryIds, flavorParamsId }))
          .pipe(map(email => ({ email })));
  }
}
