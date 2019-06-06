import { Component } from '@angular/core';
import {
    EntriesManualExecutionModeToken, EntriesStore,
    EntriesStorePaginationCacheToken
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { VidiunLogger, VidiunLoggerName } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vEntries',
  templateUrl: './content-entries.component.html',
  styleUrls: ['./content-entries.component.scss'],
  providers: [
    EntriesStore,
      { provide: EntriesManualExecutionModeToken, useValue: true},
    VidiunLogger.createLogger('ContentEntriesComponent'),
    { provide: EntriesStorePaginationCacheToken, useValue: 'entries-list' }
  ]
})
export class ContentEntriesComponent {


}

