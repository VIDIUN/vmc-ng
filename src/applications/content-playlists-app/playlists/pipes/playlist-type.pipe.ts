import { Pipe, PipeTransform } from '@angular/core';
import { VidiunPlaylistType } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({name: 'playlistType'})

export class PlaylistTypePipe implements PipeTransform {

	constructor(private appLocalization: AppLocalization) {
	}

	transform(value:number, isIcon:boolean): string {
	  let className = "",
		    playlistType = "";
		if (typeof(value) !== 'undefined' && value !== null) {
			switch (value) {
				case VidiunPlaylistType.dynamic:
				  className = 'vIconPlaylist_RuleBased'; /* TODO [vmc] should be the correct icons here and below */
					playlistType = this.appLocalization.get("applications.content.playlistType.dynamic");
					break;
				case VidiunPlaylistType.external:
          className = 'vIconPlaylist_RuleBased';
					playlistType = this.appLocalization.get("applications.content.playlistType.external");
					break;
				case VidiunPlaylistType.staticList:
          className = 'vIconPlaylist_Manual';
					playlistType = this.appLocalization.get("applications.content.playlistType.staticList");
					break;
				default:
          className = 'vIconUnknown';
					playlistType = this.appLocalization.get("applications.content.playlistType.unknown");
					break;
			}
		}
		return isIcon ? className : playlistType;
	}
}
