import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsCustomDataComponent } from './settings-custom-data.component';
import { routing } from './settings-custom-data-app.routes';
import { RouterModule } from '@angular/router';
import { AreaBlockerModule, VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import { SchemasComponents } from './schemas/schemas-components-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonModule, CalendarModule, CheckboxModule, DropdownModule, InputSwitchModule, InputTextModule, MenuModule,
  PaginatorModule,
  RadioButtonModule, SharedModule, TieredMenuModule
} from 'primeng/primeng';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module.ts';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { TooltipModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { StickyModule } from '@vidiun-ng/vidiun-ui';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';

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
    RadioButtonModule,
    VidiunPrimeNgUIModule,
    SharedModule,
    RouterModule.forChild(routing),
    StickyModule,
    EntriesModule,
    DropdownModule,
    InputSwitchModule,
    VMCPermissionsModule,
      TableModule
  ],
  declarations: [
    SettingsCustomDataComponent,
    SchemasComponents
  ]
})
export class SettingsCustomDataAppModule {
}
