import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule} from '@vidiun-ng/vidiun-ui';

import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DropdownModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  RadioButtonModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import {AutoCompleteModule, VidiunPrimeNgUIModule, VPTableModule} from '@vidiun-ng/vidiun-primeng-ui';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';

import {EntryStatusPipe} from './pipes/entry-status.pipe';
import {SchedulingComponent} from './scheduling/scheduling.component';
import {EntryTypePipe} from './pipes/entry-type.pipe';
import {EntryDurationPipe} from './pipes/entry-duration.pipe';
import {MaxEntriesPipe} from './pipes/max-entries.pipe';
import {EntriesRefineFiltersComponent} from './entries-refine-filters/entries-refine-filters.component';
import {EntriesTableComponent} from './entries-table/entries-table.component';
import {EntriesListComponent} from './entries-list/entries-list.component';
import {TagsModule} from '@vidiun-ng/vidiun-ui';
import {PrimeTableSortTransformPipe} from './pipes/prime-table-sort-transform.pipe';
import {ModerationPipe} from './pipes/moderation.pipe';
import {EntriesSelectorComponent} from './entries-selector/entries-selector.component';
import {EntriesListTagsComponent} from './entries-list/entries-list-tags.component';
import {FiltersModule} from '@vidiun-ng/mc-shared';
import {CategoriesModule} from '../categories/categories.module';
import {EntriesStoreDataProvider} from 'app-shared/content-shared/entries/entries-store/entries-store-data-provider.service';
import {EntriesDataProviderToken} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {LiveDashboardComponent} from 'app-shared/content-shared/entries/live-dashboard/live-dashboard.component';
import {LiveDashboardHostComponent} from 'app-shared/content-shared/entries/live-dashboard-host/live-dashboard-host.component';
import { LinkedEntriesTableComponent } from './link-entries-selector/linked-entries-table/linked-entries-table.component';
import { LinkedEntriesAddEntriesComponent } from './link-entries-selector/linked-entries-add-entries/linked-entries-add-entries.component';
import {LinkedEntriesComponent} from './link-entries-selector/linked-entries/linked-entries.component';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    AreaBlockerModule,
    TooltipModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    LocalizationModule,
    VidiunPrimeNgUIModule,
    VPTableModule,
    VidiunUIModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    CheckboxModule,
    PopupWidgetModule,
    TableModule,
    MenuModule,
    TagsModule,
    PaginatorModule,
    TieredMenuModule,
    InputTextModule,
    StickyModule,
    FiltersModule,
    CategoriesModule,
    VMCPermissionsModule,
      DateFormatModule
  ],
  declarations: [
    EntryStatusPipe,
    EntryTypePipe,
    SchedulingComponent,
    EntryDurationPipe,
    MaxEntriesPipe,
    PrimeTableSortTransformPipe,
    ModerationPipe,
    EntriesRefineFiltersComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesListTagsComponent,
    EntriesSelectorComponent,
    LiveDashboardComponent,
    LiveDashboardHostComponent,
    LinkedEntriesComponent,
    LinkedEntriesTableComponent,
    LinkedEntriesAddEntriesComponent
  ],
  exports: [
    EntryStatusPipe,
    EntryTypePipe,
    ModerationPipe,
    MaxEntriesPipe,
    SchedulingComponent,
    EntryDurationPipe,
    EntriesRefineFiltersComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesSelectorComponent,
    LiveDashboardComponent,
    LiveDashboardHostComponent,
	  LinkedEntriesComponent,
	  LinkedEntriesTableComponent,
	  LinkedEntriesAddEntriesComponent
  ]
})
export class EntriesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: EntriesModule,
            providers: <any[]>[
                { provide: EntriesDataProviderToken, useClass: EntriesStoreDataProvider }
            ]
        };
    }
}
