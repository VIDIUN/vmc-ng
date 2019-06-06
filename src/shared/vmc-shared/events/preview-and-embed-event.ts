import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunPlaylist } from 'vidiun-ngx-client';

export class PreviewAndEmbedEvent extends AppEvent {

    constructor(public media: VidiunPlaylist | VidiunMediaEntry)
    {
        super('PreviewAndEmbedEvent');
    }
}
