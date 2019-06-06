import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { routing } from './settings-transcoding-settings-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, DropdownModule, InputTextModule, InputTextareaModule, PaginatorModule } from 'primeng/primeng';
import { AreaBlockerModule } from '@vidiun-ng/vidiun-ui';
import { TranslateModule } from '@ngx-translate/core';
import { TranscodingProfilesComponentsList } from './transcoding-profiles/components-list';
import { VidiunUIModule, TooltipModule, StickyModule } from '@vidiun-ng/vidiun-ui';
import { MenuModule } from 'primeng/menu';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { TranscodingProfileComponentsList } from './transcoding-profile/components-list';
import { DetailsBarModule } from '@vidiun-ng/vidiun-ui';
import { TranscodingProfileCanDeactivate } from './transcoding-profile/transcoding-profile-can-deactivate.service';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    TooltipModule,
    LocalizationModule,
    VidiunUIModule,
    PaginatorModule,
    StickyModule,
    MenuModule,
    DetailsBarModule,
    TooltipModule,
    PopupWidgetModule,
    DropdownModule,
    VMCPermissionsModule,
      TableModule,
      DateFormatModule,
  ],
  declarations: [
    SettingsTranscodingSettingsComponent,
    ...TranscodingProfilesComponentsList,
    ...TranscodingProfileComponentsList
  ],
  providers: [
    TranscodingProfileCanDeactivate
  ]
})
export class SettingsTranscodingSettingsAppModule {
}
