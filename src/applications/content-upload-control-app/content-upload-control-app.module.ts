import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-upload-control-app.routes';

import { AreaBlockerModule, StickyModule } from '@vidiun-ng/vidiun-ui';
import {
  PaginatorModule,
  ButtonModule,
  TieredMenuModule,
  CheckboxModule,
  InputTextModule,
  CalendarModule,
  MenuModule,
  SharedModule,
  ProgressBarModule,
} from 'primeng/primeng';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import {
  VidiunUIModule,
  TooltipModule
} from '@vidiun-ng/vidiun-ui';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';

import { ContentUploadControlComponent } from './content-upload-control.component';
import { UploadListComponent } from './upload-list/upload-list.component';
import { UploadListTableComponent } from './upload-list/upload-list-table.component';
import { UploadProgressComponent } from './upload-list/upload-progress/upload-progress.component';
import { VMCShellModule } from 'app-shared/vmc-shell';
import { UploadStatusPipe } from './upload-list/pipes/upload-status.pipe';
import { TableModule } from 'primeng/table';
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
    ProgressBarModule,
    VMCShellModule,
    StickyModule,
    RouterModule.forChild(routing),
      TableModule,
      DateFormatModule,
  ],
  declarations: [
    ContentUploadControlComponent,
    UploadListComponent,
    UploadListTableComponent,
    UploadProgressComponent,
    UploadStatusPipe
  ],
  exports: [],
  providers: []
})
export class ContentUploadControlAppModule {
}
