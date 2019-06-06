import { Injectable } from '@angular/core';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class TranscodingProfileDetailsWidget extends TranscodingProfileWidget {
  constructor(logger: VidiunLogger) {
    super('profileDetails', logger);
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
