import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Injectable()
export class StudioHtmlMainViewService extends KmcMainViewBaseService {


    constructor(logger: KalturaLogger,
                browserService: BrowserService,
                router: Router,
                private _appPermissions: KMCPermissionsService) {
        super(logger.subLogger('StudioHtmlMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        const isViewPermitted = this._appPermissions.hasAnyPermissions([
            KMCPermissions.STUDIO_BASE,
            KMCPermissions.STUDIO_ADD_UICONF,
            KMCPermissions.STUDIO_UPDATE_UICONF,
            KMCPermissions.STUDIO_DELETE_UICONF,
        ]);
        const studioHtmlIsAvailable = !!serverConfig.externalApps.studio;
        const studioHtmlIsPermitted = this._appPermissions.hasPermission(KMCPermissions.FEATURE_SHOW_HTML_STUDIO);
        const studioV3IsAvailable = !!serverConfig.externalApps.studioV3;
        const studioV3IsPermitted = this._appPermissions.hasPermission(KMCPermissions.FEATURE_V3_STUDIO_PERMISSION);

        this._logger.info(`handle isAvailable action by user`,
            { isViewPermitted, studioHtmlIsAvailable, studioHtmlIsPermitted, studioV3IsAvailable, studioV3IsPermitted });

        return isViewPermitted &&
            (
                (studioHtmlIsAvailable && studioHtmlIsPermitted) ||
                (studioV3IsAvailable && studioV3IsPermitted)
            );
    }

    getRoutePath(): string {
        return 'studio';
    }
}


