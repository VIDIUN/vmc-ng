import { Injectable } from '@angular/core';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { WidgetsManagerBase } from '@vidiun-ng/vidiun-ui'
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { PlaylistStore } from './playlist-store.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class PlaylistWidgetsManager extends WidgetsManagerBase<VidiunPlaylist, VidiunMultiRequest> {
  private _playlistStore: PlaylistStore;

  constructor(logger: VidiunLogger) {
    super(logger.subLogger('PlaylistWidgetsManager'));
  }

  set playlistStore(value: PlaylistStore) {
    this._playlistStore = value;
  }

  public returnToPlaylists(): void {
    if (this._playlistStore) {
      this._playlistStore.returnToPlaylists();
    }
  }
}
