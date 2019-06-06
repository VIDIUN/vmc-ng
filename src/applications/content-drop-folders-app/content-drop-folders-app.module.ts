import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-drop-folders-app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
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
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

import { ContentDropFoldersComponent } from './content-drop-folders.component';
import { DropFoldersComponentsList } from './drop-folders-components-list';
import { VMCShellModule } from 'app-shared/vmc-shell';
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
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    TagsModule,
    VidiunPrimeNgUIModule,
    AutoCompleteModule,
    TreeModule,
    SharedModule,
    VMCShellModule,
    FormsModule,
    ReactiveFormsModule,
    StickyModule,
      EntriesModule,
    RouterModule.forChild(routing),
    FiltersModule,
    TableModule,
    VMCPermissionsModule,
      DateFormatModule,
  ],
  declarations: [
    ContentDropFoldersComponent,
    DropFoldersComponentsList
  ],
  exports: [],
  providers: []
})
export class ContentDropFoldersAppModule {
}
