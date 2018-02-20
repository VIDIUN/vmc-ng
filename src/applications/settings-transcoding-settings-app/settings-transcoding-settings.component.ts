import { Component } from '@angular/core';
import { SettingsTranscodingSettingsService } from './settings-transcoding-settings.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { MediaTranscodingProfilesStore } from './transcoding-profiles-store/media-transcoding-profiles-store.service';
import { LiveTranscodingProfilesStore } from './transcoding-profiles-store/live-transcoding-profiles-store.service';

@Component({
  selector: 'kmc-settings-transcoding-settings',
  template: '<router-outlet></router-outlet>',
  providers: [
    SettingsTranscodingSettingsService,
    MediaTranscodingProfilesStore,
    LiveTranscodingProfilesStore,
    KalturaLogger,
    { provide: KalturaLoggerName, useValue: 'transcoding-store.service' }
  ],
})
export class SettingsTranscodingSettingsComponent {
}
