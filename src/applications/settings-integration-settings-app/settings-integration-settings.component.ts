import {Component} from '@angular/core';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
  selector: 'vIntegrationSettings',
  templateUrl: './settings-integration-settings.component.html',
  styleUrls: ['./settings-integration-settings.component.scss']
})
export class SettingsIntegrationSettingsComponent {
  public _vmcPermissions = VMCPermissions;
  constructor(settingsIntegrationSettingsMainViewService: SettingsIntegrationSettingsMainViewService) {
      settingsIntegrationSettingsMainViewService.viewEntered();
  }
}
