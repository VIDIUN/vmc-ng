import { AppEvent } from 'shared/vmc-shared/app-events/app-event';

export class ViewCategoryEntriesEvent extends AppEvent {
  constructor(public id: number) {
    super('ViewCategoryEntries');
  }
}
