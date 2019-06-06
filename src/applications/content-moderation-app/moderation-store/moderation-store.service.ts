import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunModerationFlagListResponse } from 'vidiun-ngx-client';
import { VidiunClient } from 'vidiun-ngx-client';
import { BaseEntryGetAction } from 'vidiun-ngx-client';
import { MediaListFlagsAction } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { UserNotifyBanAction } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Injectable()
export class ModerationStore implements OnDestroy {
  constructor(private _vidiunServerClient: VidiunClient, private _appLocalization: AppLocalization) {
  }

  ngOnDestroy() {
  }

  public loadEntryModerationDetails(entryId: string): Observable<{ entry: VidiunMediaEntry, flag: VidiunModerationFlagListResponse }> {
    return this._vidiunServerClient
      .multiRequest([
        new BaseEntryGetAction(
          {
            entryId: entryId,
          }
        ).setRequestOptions({
            acceptedTypes: [VidiunMediaEntry]
        }),
        new MediaListFlagsAction({
          entryId: entryId,
          pager: new VidiunFilterPager({
            pageSize: 500,
            pageIndex: 0
          })
        })
      ])
      .map(([entry, flag]) => ({
        entry: entry.result,
        flag: flag.result
      }))
      .catch(() => {
        return Observable.throw(new Error(this._appLocalization.get('applications.content.moderationDetails.errors.entryDetails')));
      });
  }

  public banCreator(userId: string): Observable<void> {
    return this._vidiunServerClient
      .request(new UserNotifyBanAction({ userId }))
      .catch(() => {
        return Observable.throw(new Error(this._appLocalization.get('applications.content.moderationDetails.errors.ban')));
      })
  }
}

