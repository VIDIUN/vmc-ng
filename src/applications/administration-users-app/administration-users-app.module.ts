import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './administration-users-app.routes';
import { AdministrationUsersComponent } from './administration-users.component';
import { UsersComponentsList } from './users/users-components-list';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { ButtonModule, DropdownModule, MenuModule, PaginatorModule } from 'primeng/primeng';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { TableModule } from 'primeng/table';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    TableModule,
    LocalizationModule,
    PaginatorModule,
    MenuModule,
    ButtonModule,
    PopupWidgetModule,
    FormsModule,
    ReactiveFormsModule,
    VidiunPrimeNgUIModule,
    DropdownModule,
    VidiunUIModule,
    TooltipModule,
    StickyModule,
    RouterModule.forChild(routing),
    TooltipModule,
    VMCPermissionsModule,
      DateFormatModule,
  ],
  declarations: [
    AdministrationUsersComponent,
    UsersComponentsList,
    EditUserComponent
  ],
  exports: [],
  providers: []
})
export class AdministrationUsersAppModule {
}
