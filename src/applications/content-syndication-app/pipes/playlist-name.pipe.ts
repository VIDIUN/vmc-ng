import {Pipe, PipeTransform} from '@angular/core';
import {VidiunPlaylist} from 'vidiun-ngx-client';
import {AppLocalization} from '@vidiun-ng/mc-shared';

@Pipe({name: 'vToPlaylistName'})
export class PlaylistNamePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(playlistId: string, playlistsIdToObjectMap: Map<string, VidiunPlaylist>): string {
    if (!playlistId) {
      return this._appLocalization.get('applications.content.syndication.table.allContent');
    }
    if (!playlistsIdToObjectMap) {
      return playlistId;
    }

    const playlist = playlistsIdToObjectMap.get(playlistId);
    return (playlist && playlist.name) || playlistId;
  }
}
