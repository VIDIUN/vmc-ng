import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-moderation-app.routes';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesComponentsList } from './entries-components-list';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

import { AreaBlockerModule, VidiunUIModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DropdownModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  PaginatorModule,
  RadioButtonModule,
  SharedModule,
  SpinnerModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { DynamicFormModule } from '@vidiun-ng/vidiun-ui';
import { DynamicFormModule as PrimeDynamicFormModule } from '@vidiun-ng/vidiun-primeng-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VMCShellModule } from 'app-shared/vmc-shell';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { DynamicMetadataFormModule } from 'app-shared/vmc-shared';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    VidiunUIModule,
    TooltipModule,
    PaginatorModule,
    ButtonModule,
    PopupWidgetModule,
    MenuModule,
    VidiunPrimeNgUIModule,
    SharedModule,
      EntriesModule,
    AccordionModule,
    CalendarModule,
    CheckboxModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextareaModule,
    InputTextModule,
    MultiSelectModule,
    RadioButtonModule,
    SpinnerModule,
    TieredMenuModule,
    TreeModule,
    RouterModule.forChild(routing),
    AutoCompleteModule,
    DynamicFormModule,
    FormsModule,
    DynamicMetadataFormModule,
    VMCShellModule,
    PrimeDynamicFormModule,
    ReactiveFormsModule,
    TagsModule,
    VMCPermissionsModule,
      DateFormatModule,
  ],
  declarations: [
    ContentModerationComponent,
    EntriesComponentsList
  ],
  exports: [],
  providers: []
})
export class ContentModerationAppModule {
}
