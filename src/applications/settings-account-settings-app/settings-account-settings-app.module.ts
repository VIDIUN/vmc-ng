import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {ButtonModule, DropdownModule, InputTextModule} from "primeng/primeng";
import {AreaBlockerModule} from "@vidiun-ng/vidiun-ui";
import {TranslateModule} from "@ngx-translate/core";
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { SettingsAccountSettingsCanDeactivateService } from './settings-account-settings-can-deactivate.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    VMCPermissionsModule
  ],
  declarations: [SettingsAccountSettingsComponent],
    providers:[SettingsAccountSettingsCanDeactivateService]
})
export class SettingsAccountSettingsAppModule {
}
