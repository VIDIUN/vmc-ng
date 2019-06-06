import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerProfileStore } from '../partner-profile';

import { VidiunClient } from 'vidiun-ngx-client';
import { AccessControlListAction } from 'vidiun-ngx-client';

import { VidiunAccessControlFilter } from 'vidiun-ngx-client';
import { VidiunAccessControl } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunAccessControlListResponse } from 'vidiun-ngx-client';
import { AppEventsService } from '../app-events';
import { AccessControlProfileUpdatedEvent } from '../events/access-control-profile-updated.event';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class AccessControlProfileStore extends PartnerProfileStore implements OnDestroy {
  private _cachedProfiles$: Observable<{ items: VidiunAccessControl[] }>;

  constructor(private _vidiunServerClient: VidiunClient, _appEvents: AppEventsService) {
    super();

    _appEvents.event(AccessControlProfileUpdatedEvent)
      .pipe(cancelOnDestroy(this))
      .subscribe(() => {
        this._clearCache();
      });
  }

  ngOnDestroy() {
  }

  private _clearCache(): void {
    this._cachedProfiles$ = null;
  }

  public get(): Observable<{ items: VidiunAccessControl[] }> {
    if (!this._cachedProfiles$) {
      // execute the request
      this._cachedProfiles$ = this._buildGetRequest()
        .pipe(cancelOnDestroy(this))
        .map(
          response => {
            return ({items: response ? response.objects : []});
          })
        .catch(error => {
          // re-throw the provided error
          this._cachedProfiles$ = null;
          return Observable.throw(new Error('failed to retrieve access control profiles list'));
        })
        .publishReplay(1)
        .refCount();
    }

    return this._cachedProfiles$;
  }

  private _buildGetRequest(): Observable<VidiunAccessControlListResponse> {
    const filter = new VidiunAccessControlFilter({ orderBy: '-createdAt' });
    const pager = new VidiunFilterPager({ pageSize: 1000 });
    return <any>this._vidiunServerClient.request(new AccessControlListAction({ filter, pager }));
  }
}
