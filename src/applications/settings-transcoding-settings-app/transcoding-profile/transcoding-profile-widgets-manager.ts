import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@vidiun-ng/vidiun-ui';
import { TranscodingProfileStore } from './transcoding-profile-store.service';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import { VidiunConversionProfileWithAsset } from '../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';

import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class TranscodingProfileWidgetsManager extends WidgetsManagerBase<VidiunConversionProfileWithAsset, VidiunMultiRequest> {
  private _profileStore: TranscodingProfileStore;

  constructor(logger: VidiunLogger) {
    super(logger.subLogger('TranscodingProfileWidgetsManager'));
  }

  set profileStore(value: TranscodingProfileStore) {
    this._profileStore = value;
  }

  public returnToProfiles(): void {
    if (this._profileStore) {
      this._profileStore.returnToProfiles();
    }
  }
}
