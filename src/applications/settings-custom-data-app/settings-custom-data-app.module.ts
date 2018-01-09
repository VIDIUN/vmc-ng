import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsCustomDataComponent } from './settings-custom-data.component';
import { routing } from './settings-custom-data-app.routes';
import { RouterModule } from '@angular/router';
import { AreaBlockerModule, KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { SchemasComponents } from './schemas/schemas-components-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonModule, CalendarModule, CheckboxModule, DataTableModule, DropdownModule, InputSwitchModule, InputTextModule, MenuModule,
  PaginatorModule,
  RadioButtonModule, SharedModule, TieredMenuModule
} from 'primeng/primeng';
import { ContentSharedModule } from 'app-shared/content-shared/content-shared.module';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common/kaltura-common.module';
import { TooltipModule } from '@kaltura-ng/kaltura-ui/tooltip/k-tooltip.module';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.module';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui/kaltura-primeng-ui.module';
import { StickyModule } from '@kaltura-ng/kaltura-ui/sticky/sticky.module';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
    KalturaCommonModule,
    KalturaUIModule,
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
    KalturaPrimeNgUIModule,
    SharedModule,
    RouterModule.forChild(routing),
    StickyModule,
    ContentSharedModule,
    DropdownModule,
    InputSwitchModule
  ],
  declarations: [
    SettingsCustomDataComponent,
    SchemasComponents
  ]
})
export class SettingsCustomDataAppModule {
}
