import { Injectable } from '@angular/core';
import { BrowserService } from 'shared/vmc-shell/providers/browser.service';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import { BaseTranscodingProfilesStore } from './base-transcoding-profiles-store.service';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { SettingsTranscodingMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Injectable()
export class LiveTranscodingProfilesStore extends BaseTranscodingProfilesStore {
  protected localStoragePageSizeKey = 'live.transcodingProfiles.list.pageSize';
  protected transcodingProfilesListType = VidiunConversionProfileType.liveStream;

  constructor(_vidiunServerClient: VidiunClient,
              _browserService: BrowserService,
              settingsTranscodingMainView: SettingsTranscodingMainViewService,
              _logger: VidiunLogger) {
    super(_vidiunServerClient, _browserService, settingsTranscodingMainView, _logger.subLogger('LiveTranscodingProfilesStore'));
  }
}

