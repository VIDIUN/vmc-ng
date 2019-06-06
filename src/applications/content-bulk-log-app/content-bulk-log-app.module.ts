import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-bulk-log-app.routes';

import { AreaBlockerModule, VidiunUIModule, TooltipModule, StickyModule } from '@vidiun-ng/vidiun-ui';
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  SharedModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { ContentBulkLogAppComponent } from './content-bulk-log-app.component';
import { BulkLogTableComponent } from './bulk-log-table/bulk-log-table.component';
import { BulkLogListComponent } from './bulk-log-list/bulk-log-list.component';
import { BulkLogObjectTypePipe } from './pipes/bulk-log-object-type.pipe';
import { BulkLogStatusPipe } from './pipes/bulk-log-status.pipe';
import { BulkLogRefineFiltersComponent } from './bulk-log-refine-filters/bulk-log-refine-filters.component';
import { BulkLogStatusIconPipe } from './pipes/bulk-log-status-icon.pipe';
import { BulkLogTagsComponent } from './bulk-log-tags/bulk-log-tags.component';
import { FiltersModule } from '@vidiun-ng/mc-shared';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    VidiunUIModule,
    PaginatorModule,
    TooltipModule,
    ButtonModule,
    TieredMenuModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    TagsModule,
    VidiunPrimeNgUIModule,
    AutoCompleteModule,
    SharedModule,
    RouterModule.forChild(routing),
    TreeModule,
    StickyModule,
      FiltersModule,
    TableModule,
    VMCPermissionsModule,
      DateFormatModule,
  ],
  declarations: [
    ContentBulkLogAppComponent,
    BulkLogTableComponent,
    BulkLogListComponent,
    BulkLogObjectTypePipe,
    BulkLogStatusPipe,
    BulkLogStatusIconPipe,
    BulkLogRefineFiltersComponent,
    BulkLogTagsComponent
  ],
  exports: []
})
export class ContentBulkLogAppModule {
}
