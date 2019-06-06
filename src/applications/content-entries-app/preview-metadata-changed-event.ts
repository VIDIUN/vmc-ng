import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class PreviewMetadataChangedEvent extends AppEvent {

    constructor(public entryId: string)
    {
        super('PreviewMetadataChangedEvent');
    }
}