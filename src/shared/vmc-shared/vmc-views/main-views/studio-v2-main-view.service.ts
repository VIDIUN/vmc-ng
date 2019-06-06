import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class StudioV2MainViewService extends VmcMainViewBaseService {


    constructor(logger: VidiunLogger,
                browserService: BrowserService,
                router: Router,
                private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                titleService: Title,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('StudioV2MainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        const isViewPermitted = this._appPermissions.hasAnyPermissions([
            VMCPermissions.STUDIO_BASE,
            VMCPermissions.STUDIO_ADD_UICONF,
            VMCPermissions.STUDIO_UPDATE_UICONF,
            VMCPermissions.STUDIO_DELETE_UICONF,
        ]);
        const studioHtmlIsAvailable = !!serverConfig.externalApps.studioV2;
        const studioHtmlIsPermitted = this._appPermissions.hasPermission(VMCPermissions.FEATURE_SHOW_HTML_STUDIO);

        this._logger.info(`handle isAvailable action by user`,
            { isViewPermitted, studioHtmlIsAvailable, studioHtmlIsPermitted });

        return isViewPermitted && studioHtmlIsAvailable && studioHtmlIsPermitted;
    }

    getRoutePath(): string {
        return 'studio/v2';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'studio-v2',
            title: this._appLocalization.get('app.titles.studioV2PageTitle'),
            menu: this._appLocalization.get('app.titles.studioV2MenuTitle')
        };
    }
}


