import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DetailsBarModule} from '@vidiun-ng/vidiun-ui';
import {TagsModule} from '@vidiun-ng/vidiun-ui';
import {
    AccordionModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    ConfirmationService,
    ConfirmDialogModule,
    DropdownModule,
    InputSwitchModule,
    InputTextareaModule,
    InputTextModule,
    MenuModule,
    MultiSelectModule,
    OverlayPanelModule,
    PaginatorModule,
    RadioButtonModule,
    SharedModule,
    SpinnerModule,
    TieredMenuModule,
    TreeModule
} from 'primeng/primeng';
import {VMCShellModule} from 'app-shared/vmc-shell';

import {routing} from './content-entries-app.routes';
import {ContentEntriesComponent} from './content-entries.component';

import {DynamicMetadataFormModule} from 'app-shared/vmc-shared';

import {LocalizationModule} from '@vidiun-ng/mc-shared';
import {VidiunPrimeNgUIModule} from '@vidiun-ng/vidiun-primeng-ui';
import {AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule} from '@vidiun-ng/vidiun-ui';
import {AutoCompleteModule} from '@vidiun-ng/vidiun-primeng-ui';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';
import {DynamicFormModule} from '@vidiun-ng/vidiun-ui';
import {DynamicFormModule as PrimeDynamicFormModule} from '@vidiun-ng/vidiun-primeng-ui';
import {EntryComponentsList} from './entry/entry-components-list';
import {EntriesComponentsList} from './entries/entries-components-list';

import {EntryCanDeactivate} from './entry/entry-can-deactivate.service';
import {EntriesModule} from 'app-shared/content-shared/entries/entries.module';
import {ContentEntriesAppService} from './content-entries-app.service';
import {CategoriesModule} from 'app-shared/content-shared/categories/categories.module';
import {CopyToClipboardModule} from '@vidiun-ng/mc-shared';
import {VEditHosterModule} from 'app-shared/vmc-shared/vedit-hoster/vedit-hoster.module';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';
import { EntriesListService } from './entries/entries-list.service';
import { InputHelperModule } from '@vidiun-ng/vidiun-ui';
import { AnalyticsLiveModule } from 'app-shared/vmc-shared/analytics-live/analytics-live.module';
import { VPTableModule } from '@vidiun-ng/vidiun-primeng-ui';
import { ClearableInputModule } from '@vidiun-ng/vidiun-primeng-ui';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    AccordionModule,
    AreaBlockerModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
      CategoriesModule,
    DropdownModule,
    DynamicFormModule,
    FormsModule,
    InputTextareaModule,
    InputTextModule,
    LocalizationModule,
    DynamicMetadataFormModule,
    VidiunPrimeNgUIModule,
    VidiunUIModule,
    VMCShellModule,
    MenuModule,
    MultiSelectModule,
    PaginatorModule,
    PopupWidgetModule,
    PrimeDynamicFormModule,
    RadioButtonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routing),
    SharedModule,
    SpinnerModule,
    TagsModule,
    TieredMenuModule,
    TooltipModule,
    TreeModule,
    DetailsBarModule,
      EntriesModule,
    StickyModule,
    CopyToClipboardModule,
    OverlayPanelModule,
    VEditHosterModule,
    StickyModule,
    VMCPermissionsModule,
    TableModule,
    InputSwitchModule,
    InputHelperModule,
    AnalyticsLiveModule,
    VPTableModule,
      ClearableInputModule,
      DateFormatModule,
  ],
  declarations: [
    ContentEntriesComponent,
    EntryComponentsList,
    EntriesComponentsList,
  ],
  exports: [],
  providers: [
    ConfirmationService,
    EntryCanDeactivate,
    EntriesListService,
    ContentEntriesAppService
  ],
})
export class ContentEntriesAppModule {
}
