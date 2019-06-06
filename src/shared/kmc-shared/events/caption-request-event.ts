import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';
import { ReachData } from 'app-shared/vmc-shared/reach-frame';
import { ReachPages } from 'app-shared/vmc-shared/vmc-views/details-views';

export class CaptionRequestEvent extends AppEvent {
    constructor(public data: ReachData, public page: ReachPages) {
        super('CaptionRequestEvent');
    }
}
