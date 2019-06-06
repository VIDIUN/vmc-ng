import { Component } from '@angular/core';
import { SettingsTranscodingSettingsService } from './settings-transcoding-settings.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { MediaTranscodingProfilesStore } from './transcoding-profiles/transcoding-profiles-store/media-transcoding-profiles-store.service';
import { LiveTranscodingProfilesStore } from './transcoding-profiles/transcoding-profiles-store/live-transcoding-profiles-store.service';

@Component({
  selector: 'vmc-settings-transcoding-settings',
  template: '<router-outlet></router-outlet>',
  providers: [
    SettingsTranscodingSettingsService,
    MediaTranscodingProfilesStore,
    LiveTranscodingProfilesStore,
    VidiunLogger.createLogger('SettingsTranscodingSettings')
  ],
})
export class SettingsTranscodingSettingsComponent {
}
