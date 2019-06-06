import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class ClearEntriesSelectionEvent extends AppEvent {

    constructor() {
        super('ClearEntriesSelectionEvent');
    }
}
