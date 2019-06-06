import { Component } from '@angular/core';
import { RolesStoreService } from './roles-store/roles-store.service';
import { VidiunLogger, VidiunLoggerName } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vRoles',
  templateUrl: './administration-roles.component.html',
  styleUrls: ['./administration-roles.component.scss'],
  providers: [
    RolesStoreService,
    VidiunLogger.createLogger('AdministrationRoles')
  ]
})

export class AdministrationRolesComponent {
}
