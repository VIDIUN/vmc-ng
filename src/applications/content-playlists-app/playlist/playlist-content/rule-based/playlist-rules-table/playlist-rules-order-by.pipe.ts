import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunPlayableEntryOrderBy } from 'vidiun-ngx-client';
import { PlaylistRule } from '../playlist-rule/playlist-rule.interface';

@Pipe({ name: 'playlistRuleOrderBy' })
export class PlaylistOrderByPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(rule: PlaylistRule = null): string {
    switch (true) {
      case VidiunPlayableEntryOrderBy.playsDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostPlayed');

      case VidiunPlayableEntryOrderBy.recentDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostRecent');

      case VidiunPlayableEntryOrderBy.rankDesc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.highestRated');

      case VidiunPlayableEntryOrderBy.nameAsc === rule.orderBy:
        return this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName');

      default:
        return '';
    }
  }
}
