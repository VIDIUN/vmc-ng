import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';
import { ConversionProfileListAction } from 'vidiun-ngx-client';
import { VidiunConversionProfileFilter } from 'vidiun-ngx-client';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunConversionProfileListResponse } from 'vidiun-ngx-client';
import { VidiunConversionProfile } from 'vidiun-ngx-client';
import { AppEventsService } from 'app-shared/vmc-shared';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { TranscodingProfilesUpdatedEvent } from 'app-shared/vmc-shared/events';

@Injectable()
export class TranscodingProfileManagement implements OnDestroy {
  private _transcodingProfileCache$;

  constructor(private _serverClient: VidiunClient,
              _appEvents: AppEventsService) {
      _appEvents.event(TranscodingProfilesUpdatedEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => {
              this._clearCache();
          });
  }

    ngOnDestroy() {
    }

    private _clearCache(): void {
        this._transcodingProfileCache$ = null;
    }

  private _loadTranscodingProfiles(): Observable<VidiunConversionProfile[]> {
    return this._serverClient
      .request(
          new ConversionProfileListAction({
              filter: new VidiunConversionProfileFilter({ typeEqual: VidiunConversionProfileType.media }),
              pager: new VidiunFilterPager({ pageSize: 500 })
          })
      )
      .map((res: VidiunConversionProfileListResponse) => res.objects);
  }

  public get(): Observable<VidiunConversionProfile[]> {
    if (!this._transcodingProfileCache$) {
      this._transcodingProfileCache$ = this._loadTranscodingProfiles()
        .catch(err => {
          console.log(`log: [warn] [transcodingProfile-management] Error during load transcoding profiles: ${err}`);
          this._transcodingProfileCache$ = null;
          return Observable.throw(err);
        })
        .publishReplay(1)
        .refCount();
    }

    return this._transcodingProfileCache$;
  }
}
