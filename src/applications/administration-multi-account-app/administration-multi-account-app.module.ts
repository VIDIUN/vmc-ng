import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@vidiun-ng/vidiun-ui';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DropdownModule, InputSwitchModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  RadioButtonModule,
  SharedModule,
  SpinnerModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { VMCShellModule } from 'app-shared/vmc-shell';

import { routing } from './administration-multi-account-app.routes';
import { AdministrationMultiAccountComponent } from './administration-multi-account.component';

import { DynamicMetadataFormModule } from 'app-shared/vmc-shared';

import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { DynamicFormModule } from '@vidiun-ng/vidiun-ui';
import { DynamicFormModule as PrimeDynamicFormModule } from '@vidiun-ng/vidiun-primeng-ui';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from '@vidiun-ng/vidiun-primeng-ui';
import { AccountsListComponent } from './accounts-list/accounts-list.component';
import { AccountsTableComponent } from './accounts-table/accounts-table.component';
import { AccountsRefineFiltersComponent } from './accounts-refine-filters/accounts-refine-filters.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { StatusPipe } from './pipes/status.pipe';
import { AccountsTagsComponent } from './accounts-tags/accounts-tags.component';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';
import { FiltersModule } from '@vidiun-ng/mc-shared';

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
    StickyModule,
    VMCPermissionsModule,
    TableModule,
    InputSwitchModule,
      DateFormatModule,
      FiltersModule
  ],
  declarations: [
    AdministrationMultiAccountComponent,
    AccountsListComponent,
    AccountsTableComponent,
    StatusPipe,
    AccountsRefineFiltersComponent,
    AccountsTagsComponent,
    NewAccountComponent
  ],
  exports: [],
  providers: [],
})
export class AdministrationMultiAccountAppModule {
}
