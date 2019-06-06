import { Component } from '@angular/core';
import { AccessControlProfilesStore } from './profiles/profiles-store/profiles-store.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vmc-settings-access-control',
  template: '<vAccessControlProfilesList></vAccessControlProfilesList>',
  providers: [
    AccessControlProfilesStore,
    VidiunLogger.createLogger('SettingsAccessControl')
  ]
})
export class SettingsAccessControlComponent {
}
