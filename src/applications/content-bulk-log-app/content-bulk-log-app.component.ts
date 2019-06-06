import { Component } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BulkLogRefineFiltersService } from './bulk-log-store/bulk-log-refine-filters.service';

@Component({
  selector: 'vBulkLog',
  template: '<router-outlet></router-outlet>',
  providers: [
    BulkLogRefineFiltersService,
    VidiunLogger.createLogger('ContentBulkLogApp')
  ]
})
export class ContentBulkLogAppComponent {
}

