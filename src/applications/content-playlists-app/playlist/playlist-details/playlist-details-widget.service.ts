import { Injectable } from '@angular/core';
import { PlaylistWidget } from '../playlist-widget';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
@Injectable()
export class PlaylistDetailsWidget extends PlaylistWidget {
  constructor(logger: VidiunLogger) {
    super('playlistDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}
