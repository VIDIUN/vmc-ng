import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings-access-control-app.routes';
import { RouterModule } from '@angular/router';
import { SettingsAccessControlComponent } from './settings-access-control.component';
import { ProfilesComponentsList } from './profiles/profiles-components-list';
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  InputSwitchModule,
  InputTextModule,
  MenuModule, MultiSelectModule,
  PaginatorModule, RadioButtonModule,
  SharedModule, SpinnerModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { FiltersModule } from '@vidiun-ng/mc-shared';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { TimeSpinnerModule } from '@vidiun-ng/vidiun-primeng-ui';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';
import { VPTableModule } from '@vidiun-ng/vidiun-primeng-ui';
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
    RadioButtonModule,
    MultiSelectModule,
    SpinnerModule,
    InputSwitchModule,
    VMCPermissionsModule,
    TimeSpinnerModule,
      TableModule,
      VPTableModule,
      DateFormatModule,
  ],
  declarations: [
    SettingsAccessControlComponent,
    ...ProfilesComponentsList
  ]
})
export class SettingsAccessControlAppModule {
}
