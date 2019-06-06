import { ModuleWithProviders, NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, VidiunUIModule, TooltipModule} from '@vidiun-ng/vidiun-ui';
import {
  ButtonModule,
  CheckboxModule,
  DropdownModule,
  InputSwitchModule,
  InputTextModule,
  MenuModule,
  SharedModule
} from 'primeng/primeng';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import {VidiunPrimeNgUIModule} from '@vidiun-ng/vidiun-primeng-ui';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';

import {UploadMenuComponent} from './upload-menu/upload-menu.component';
import {UploadSettingsComponent} from './upload-settings/upload-settings.component';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {BulkUploadMenuComponent} from './bulk-upload-menu/bulk-upload-menu.component';
import {UploadMonitorComponent} from './upload-monitor/upload-monitor.component';
import {UploadMonitorSectionComponent} from './upload-monitor/upload-monitor-section/upload-monitor-section.component';
import {ManualLiveComponent} from './create-live/manual-live/manual-live.component';
import {UniversalLiveComponent} from './create-live/universal-live/universal-live.component';
import {TranscodingProfileSelectComponent} from './prepare-entry/transcoding-profile-select/transcoding-profile-select.component';
import {CreateLiveComponent} from './create-live/create-live.component';
import {VidiunLiveStreamComponent} from './create-live/vidiun-live-stream/vidiun-live-stream.component';
import {PrepareEntryComponent} from './prepare-entry/prepare-entry.component';
import { NewUploadMonitorService } from './upload-monitor/new-upload-monitor.service';
import { BulkUploadMonitorService } from './upload-monitor/bulk-upload-monitor.service';
import { DropFoldersMonitorService } from './upload-monitor/drop-folders-monitor.service';
import { VidiunLogger, VidiunLoggerName } from '@vidiun-ng/vidiun-logger';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';
import { UploadFromYoutubeComponent } from './upload-from-youtube/upload-from-youtube.component';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    VidiunUIModule,
    TooltipModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    PopupWidgetModule,
    MenuModule,
    VidiunPrimeNgUIModule,
    SharedModule,
    InputSwitchModule,
    CheckboxModule,
    VMCPermissionsModule,
      TableModule
  ],
  declarations: [
    UploadMenuComponent,
    UploadSettingsComponent,
    UploadButtonComponent,
    BulkUploadMenuComponent,
    UploadButtonComponent,
    UploadMonitorComponent,
    UploadMonitorSectionComponent,
    UploadButtonComponent,
    PrepareEntryComponent,
    TranscodingProfileSelectComponent,
    CreateLiveComponent,
    VidiunLiveStreamComponent,
    UniversalLiveComponent,
    ManualLiveComponent,
      UploadFromYoutubeComponent
  ],
  exports: [
    UploadButtonComponent,
    UploadMonitorComponent
  ]
})
export class VmcUploadAppModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: VmcUploadAppModule,
      providers: <any[]>[
        VidiunLogger,
        {
          provide: VidiunLoggerName, useValue: 'upload-monitor'
        },
        BulkUploadMonitorService,
        NewUploadMonitorService,
        DropFoldersMonitorService
      ]
    };
  }
}
