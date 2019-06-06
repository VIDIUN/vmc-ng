import {AppEvent} from 'app-shared/vmc-shared/app-events/app-event';
import { VMCAppMenuItem } from 'app-shared/vmc-shared/vmc-views';

export class UpdateMenuEvent extends AppEvent {

    constructor(public menuID: string,  public menu: VMCAppMenuItem[], public position: string)
    {
        super('UpdatedMenuEvent');
    }
}
