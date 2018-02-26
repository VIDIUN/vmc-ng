import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PartnerProfileStore } from '../partner-profile';

import { KalturaClient } from 'kaltura-ngx-client';
import { AccessControlListAction } from 'kaltura-ngx-client/api/types/AccessControlListAction';

import { KalturaAccessControlFilter } from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaAccessControlListResponse } from 'kaltura-ngx-client/api/types/KalturaAccessControlListResponse';
import { AppEventsService } from '../app-events';
import { AccessControlProfileUpdatedEvent } from '../events/access-control-profile-updated.event';

@Injectable()
export class AccessControlProfileStore extends PartnerProfileStore implements OnDestroy {
  private _cachedProfiles$: Observable<{ items: KalturaAccessControl[] }>;

  constructor(private _kalturaServerClient: KalturaClient, _appEvents: AppEventsService) {
    super();

    _appEvents.event(AccessControlProfileUpdatedEvent)
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._clearCache();
      });
  }

  ngOnDestroy() {
  }

  private _clearCache(): void {
    this._cachedProfiles$ = null;
  }

  public get(): Observable<{ items: KalturaAccessControl[] }> {
    if (!this._cachedProfiles$) {
      // execute the request
      this._cachedProfiles$ = this._buildGetRequest()
        .cancelOnDestroy(this)
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

  private _buildGetRequest(): Observable<KalturaAccessControlListResponse> {
    const filter = new KalturaAccessControlFilter({ orderBy: '-createdAt' });
    const pager = new KalturaFilterPager({ pageSize: 1000 });
    return <any>this._kalturaServerClient.request(new AccessControlListAction({ filter, pager }));
  }
}
