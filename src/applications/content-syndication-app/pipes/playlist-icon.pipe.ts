import {Pipe, PipeTransform} from '@angular/core';
import {VidiunPlaylist} from 'vidiun-ngx-client';
import {VidiunPlaylistType} from 'vidiun-ngx-client';

@Pipe({name: 'vToPlaylistIcon'})
export class PlaylistIconPipe implements PipeTransform {
  constructor() {
  }

  transform(playlistId: string, playlistsIdToNameMap: Map<string, VidiunPlaylist>): string {
    if (!playlistId) {
      return '';
    }
    if (!playlistsIdToNameMap) {
      return playlistId;
    }

    const playlist = playlistsIdToNameMap.get(playlistId);
    if (!playlist) {
        return '';
    }

    const playlistType = playlist.playlistType;

    if (typeof(playlistType) !== 'undefined' && playlistType !== null) {
      switch (playlistType) {
        case VidiunPlaylistType.dynamic:
        case VidiunPlaylistType.external:
          return 'vIconPlaylist_RuleBased';
        case VidiunPlaylistType.staticList:
          return 'vIconPlaylist_Manual';
        default:
          return 'vIconUnknown';
      }
    }
  }
}
