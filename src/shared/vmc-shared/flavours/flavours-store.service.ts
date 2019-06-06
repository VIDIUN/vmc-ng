import {Injectable, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import {PartnerProfileStore} from '../partner-profile';
import 'rxjs/add/observable/throw';
import {VidiunClient} from 'vidiun-ngx-client';
import {FlavorParamsListAction} from 'vidiun-ngx-client';
import {VidiunFlavorParams} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunFlavorParamsListResponse} from 'vidiun-ngx-client';
import {VidiunDetachedResponseProfile} from 'vidiun-ngx-client';
import {VidiunResponseProfileType} from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class FlavoursStore extends PartnerProfileStore implements OnDestroy {

  private _getFlavorsFilters$: Observable<{ items: VidiunFlavorParams[] }>;

  constructor(private _vidiunServerClient: VidiunClient) {
    super();
  }

  public get(): Observable<{ items: VidiunFlavorParams[] }> {
    if (!this._getFlavorsFilters$) {
      // execute the request
      this._getFlavorsFilters$ = this._buildGetRequest()
        .pipe(cancelOnDestroy(this))
        .map(
          response => {
            return ({items: response ? response.objects : []});
          })
        .catch(error => {
            // re-throw the provided error
            this._getFlavorsFilters$ = null;
            return Observable.throw(new Error('failed to retrieve flavors list'));
        })
        .publishReplay(1)
        .refCount();
    }

    return this._getFlavorsFilters$;
  }

  ngOnDestroy()
  {
  }

  private _buildGetRequest(): Observable<VidiunFlavorParamsListResponse> {

    const responseProfile: VidiunDetachedResponseProfile = new VidiunDetachedResponseProfile(
      {
        fields: 'id,format,name,width,height,videoCodec,audioBitrate,videoBitrate,tags',
        type: VidiunResponseProfileType.includeFields
      }
    );

    const favourParamsPager = new VidiunFilterPager();
    favourParamsPager.pageSize = 500;

    return this._vidiunServerClient.request(new FlavorParamsListAction({pager: favourParamsPager})
        .setRequestOptions({
            responseProfile
        }));
  }
}
