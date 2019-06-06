import { Component } from '@angular/core';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunLoggerName } from '@vidiun-ng/vidiun-logger';

@Component({
    selector: 'vPlaylists',
    templateUrl: './content-playlists.component.html',
    styleUrls: ['./content-playlists.component.scss'],
    providers: [
      PlaylistsStore,
        VidiunLogger,
        {
            provide: VidiunLoggerName, useValue: 'playlists-store.service'
        }
    ]
})
export class ContentPlaylistsComponent  {}

