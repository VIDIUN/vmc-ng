import { AreaBlockerMessage, AreaBlockerMessageButton, WidgetBase } from '@vidiun-ng/vidiun-ui';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import { PlaylistWidgetsManager } from './playlist-widgets-manager';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';


export abstract class PlaylistWidget extends WidgetBase<PlaylistWidgetsManager, VidiunPlaylist, VidiunMultiRequest> {
  public sectionBlockerMessage: AreaBlockerMessage;
  public showSectionLoader: boolean;

  constructor(private _widgetKey: string, logger: VidiunLogger) {
    super(_widgetKey, logger);
  }

  protected _showLoader() {
    this._removeBlockerMessage();
    this.showSectionLoader = true;
  }

  protected _hideLoader() {
    this.showSectionLoader = false;
  }

  protected _removeBlockerMessage(): void {
    this.sectionBlockerMessage = null;
  }

  protected _showBlockerMessage(message: AreaBlockerMessage, addBackToPlaylistsButton: boolean) {
    let messageToShow = message;
    if (addBackToPlaylistsButton) {
      messageToShow = new AreaBlockerMessage({
        message: message.message,
        buttons: [
          ...this._createBackToPlaylistsButton(),
          ...message.buttons
        ]
      })
    }

    this.showSectionLoader = false;
    this.sectionBlockerMessage = messageToShow;
  }

  protected _createBackToPlaylistsButton(): AreaBlockerMessageButton[] {
    if (this.form) {
      return [{
        label: 'Back To Playlists',
        action: () => {
          this.form.returnToPlaylists();
        }
      }];
    } else {
      return [{
        label: 'Dismiss',
        action: () => {
          this._removeBlockerMessage();
        }
      }];
    }
  }

  protected _showActivationError(message?: string) {
    this._showBlockerMessage(new AreaBlockerMessage(
      {
        message: message || 'An error occurred while loading data',
        buttons: [
          {
            label: 'Retry',
            action: () => {
              this.activate();
            }
          }
        ]
      }
    ), true);
  }
}
