import { AppEvent } from 'shared/vmc-shared/app-events/app-event';
import { VidiunPlaylistType } from 'vidiun-ngx-client';
import { ContentPlaylistViewSections } from 'app-shared/vmc-shared/vmc-views/details-views';

export interface CreateNewPlaylistEventArgs {
  name?: string;
  type: VidiunPlaylistType;
  description?: string;
  playlistContent?: string; // entry ids separated by comma
}

export class CreateNewPlaylistEvent extends AppEvent {
  constructor(public data: CreateNewPlaylistEventArgs, public section?: ContentPlaylistViewSections) {
    super('CreateNewPlaylist');
  }
}
