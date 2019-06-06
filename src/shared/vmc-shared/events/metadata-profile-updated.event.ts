import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class MetadataProfileUpdatedEvent extends AppEvent {
  constructor() {
    super('MetadataProfileUpdated');
  }
}
