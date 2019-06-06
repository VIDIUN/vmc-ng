import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class ResetMenuEvent extends AppEvent {

    constructor() {
        super('ResetMenuEvent');
    }
}
