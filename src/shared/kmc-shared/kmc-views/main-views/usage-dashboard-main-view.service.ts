import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';

@Injectable()
export class UsageDashboardMainViewService extends KmcMainViewBaseService {

    private _logger: KalturaLogger;

    constructor(
        logger: KalturaLogger,
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
        this._logger = logger.subLogger('UsageDashboardMainViewService');
    }

    isAvailable(): boolean {
        return this._isUsageDashboardAppValid() && this._appPermissions.hasAnyPermissions([
            KMCPermissions.FEATURE_ENABLE_USAGE_DASHBOARD,
            KMCPermissions.ANALYTICS_BASE
        ]);
    }

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl('usageDashboard'));
    }


    private _isUsageDashboardAppValid(): boolean {
    let isValid = false;
    if (serverConfig.externalApps.usageDashboard.enabled) {
        isValid =
            !!serverConfig.externalApps.usageDashboard.uri &&
            !serverConfig.externalApps.usageDashboard.uri.match(/\s/g) && // not contains white spaces
            typeof (serverConfig.externalApps.usageDashboard.uiConfId) !== 'undefined' &&
            serverConfig.externalApps.usageDashboard.uiConfId !== null &&
            serverConfig.externalApps.usageDashboard.map_urls &&
            serverConfig.externalApps.usageDashboard.map_urls.length &&
            serverConfig.externalApps.usageDashboard.map_urls.indexOf('') === -1 && // no empty url
            !!serverConfig.externalApps.usageDashboard.map_zoom_levels;

        if (!isValid) {
            this._logger.debug(`Disabling Usage Dashboard standalone application - configuration is invalid`);
        }
    }else{
        this._logger.debug(`Disabling Usage Dashboard standalone application - Usage Dashboard is disabled`);
    }
    return isValid;
}
}


