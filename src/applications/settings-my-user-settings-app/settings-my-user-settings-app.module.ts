import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings-my-user-settings-app.routes';
import { RouterModule } from '@angular/router';
import { AreaBlockerModule, VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { SettingsMyUserSettingsComponent } from './settings-my-user-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { EditUserNameComponent } from './edit-user-name/edit-user-name.component';
import { EditEmailAddressComponent } from './edit-email-address/edit-email-address.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, InputTextModule, } from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    VidiunUIModule,
    TranslateModule,
    PopupWidgetModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RouterModule.forChild(routing)
  ],
  declarations: [
    SettingsMyUserSettingsComponent,
    EditUserNameComponent,
    EditEmailAddressComponent,
    ChangePasswordComponent
  ]
})
export class SettingsMyUserSettingsAppModule {
}
