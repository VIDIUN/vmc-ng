import { PartnerListFeatureStatusAction } from 'vidiun-ngx-client';
import { VidiunFeatureStatusListResponse } from 'vidiun-ngx-client';
import { RequestFactory } from '@vidiun-ng/vidiun-common';

export class CategoriesStatusRequestFactory implements RequestFactory<PartnerListFeatureStatusAction, VidiunFeatureStatusListResponse> {

  constructor() {
  }

  create(): PartnerListFeatureStatusAction {
    return new PartnerListFeatureStatusAction({});
  }
}
