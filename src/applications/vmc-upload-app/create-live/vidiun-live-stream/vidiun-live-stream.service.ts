import {Injectable} from '@angular/core';
import {VidiunClient} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {ConversionProfileListAction} from 'vidiun-ngx-client';
import {VidiunConversionProfileFilter} from 'vidiun-ngx-client';
import {VidiunConversionProfileType} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunConversionProfile} from 'vidiun-ngx-client';

@Injectable()
export class VidiunLiveStreamService {

  constructor(private _vidiunServerClient: VidiunClient) {
  }

  public getVidiunConversionProfiles(): Observable<VidiunConversionProfile[]> {
    // filter
    const vidiunConversionProfileFilter = new VidiunConversionProfileFilter({
      typeEqual: VidiunConversionProfileType.liveStream
    });

    // pager
    const vidiunFilterPager = new VidiunFilterPager({pageSize: 500, pageIndex: 1});

    return this._vidiunServerClient
      .request(new ConversionProfileListAction({filter: vidiunConversionProfileFilter, pager: vidiunFilterPager}))
      .map(response => (<VidiunConversionProfile[]>response.objects))
  }
}
