import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerProfileStore } from '../partner-profile';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunStorageProfileStatus } from 'vidiun-ngx-client';
import { VidiunStorageProfileFilter } from 'vidiun-ngx-client';
import { StorageProfileListAction } from 'vidiun-ngx-client';
import { VidiunStorageProfileListResponse } from 'vidiun-ngx-client';
import { VidiunStorageProfile } from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class StorageProfilesStore extends PartnerProfileStore implements OnDestroy {

  private _getStorageProfiles$: Observable<{ items: VidiunStorageProfile[] }>;

  constructor(private _vidiunServerClient: VidiunClient) {
    super();
  }

  public get(): Observable<{ items: VidiunStorageProfile[] }> {
    if (!this._getStorageProfiles$) {
      // execute the request
      this._getStorageProfiles$ = this._buildGetRequest()
        .pipe(cancelOnDestroy(this))
        .map(response => ({ items: response ? response.objects : [] }))
        .catch(
          error => {
            // re-throw the provided error
            this._getStorageProfiles$ = null;
            return Observable.throw(error);
          }
        )
        .publishReplay(1)
        .refCount();
    }

    return this._getStorageProfiles$;
  }

  ngOnDestroy() {
  }

  private _buildGetRequest(): Observable<VidiunStorageProfileListResponse> {
    return this._vidiunServerClient.request(new StorageProfileListAction({
      filter: new VidiunStorageProfileFilter({
        statusIn: [VidiunStorageProfileStatus.automatic, VidiunStorageProfileStatus.manual].join(',')
      })
    }));
  }
}
