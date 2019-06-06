import { Component } from '@angular/core';
import { SchemasStore } from './schemas/schemas-store/schemas-store.service';
import { VidiunLogger, VidiunLoggerName } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vmc-settings-custom-data',
  templateUrl: './settings-custom-data.component.html',
  styleUrls: ['./settings-custom-data.component.scss'],
  providers: [
    SchemasStore,
    VidiunLogger,
    { provide: VidiunLoggerName, useValue: 'CustomData' }
  ]
})
export class SettingsCustomDataComponent {
}
