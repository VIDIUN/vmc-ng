import { Component } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { VidiunPlaylistType } from 'vidiun-ngx-client';

@Component({
  selector: 'vPlaylistContent',
  templateUrl: './playlist-content.component.html'
})
export class PlaylistContentComponent {
  public _playlistTypes = VidiunPlaylistType;
  constructor(public _playlistStore: PlaylistStore) {
  }
}
