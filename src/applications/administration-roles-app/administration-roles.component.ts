import { Component } from '@angular/core';
import { RolesStoreService } from './roles-store/roles-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kRoles',
  templateUrl: './administration-roles.component.html',
  styleUrls: ['./administration-roles.component.scss'],
  providers: [
    RolesStoreService,
    KalturaLogger,
    { provide: KalturaLoggerName, useValue: 'roles-store.service' }
  ]
})

export class AdministrationRolesComponent {
}
