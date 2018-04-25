import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class SettingsAccessControlMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('SettingsAccessControlMainViewService'), router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.ACCESS_CONTROL_BASE,
            KMCPermissions.ACCESS_CONTROL_ADD,
            KMCPermissions.ACCESS_CONTROL_UPDATE,
            KMCPermissions.ACCESS_CONTROL_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/accessControl';
    }
}
