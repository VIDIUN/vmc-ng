import { Component, ViewChild } from '@angular/core';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { SettingsTranscodingMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { BrowserService } from 'shared/vmc-shell/providers/browser.service';

@Component({
  selector: 'v-transcoding-profiles-lists-holder',
  templateUrl: './transcoding-profiles-lists-holder.component.html',
  styleUrls: ['./transcoding-profiles-lists-holder.component.scss'],
  providers: [VidiunLogger.createLogger('TranscodingProfilesListsHolderComponent')]
})
export class TranscodingProfilesListsHolderComponent {
  @ViewChild('addNewProfile') _addNewProfilePopup: PopupWidgetComponent;

  public _vidiunConversionProfileType = VidiunConversionProfileType;
  public _blockerMessage: AreaBlockerMessage;
  public _newProfileType: VidiunConversionProfileType;
  public _vmcPermissions = VMCPermissions;

  constructor(private _logger: VidiunLogger, browserService: BrowserService, settingsTranscodingMainView: SettingsTranscodingMainViewService) {
        settingsTranscodingMainView.viewEntered();
  }

  public _setBlockerMessage(message: AreaBlockerMessage): void {
    this._blockerMessage = message;
  }

  public _addProfile(profileType: VidiunConversionProfileType): void {
    this._logger.info(`handle 'add' profile action by the user`, { profileType });
    this._newProfileType = profileType;
    this._addNewProfilePopup.open();
  }
}
