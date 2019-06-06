import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class UpdateEntriesListEvent extends AppEvent {

  constructor() {
    super('UpdateEntriesListEvent');
  }
}
