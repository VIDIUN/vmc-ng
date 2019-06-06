import {AppEvent} from 'app-shared/vmc-shared/app-events/app-event';

export class UpdateClipsEvent extends AppEvent {

  constructor() {
    super('UpdateClipsEvent');
  }
}
