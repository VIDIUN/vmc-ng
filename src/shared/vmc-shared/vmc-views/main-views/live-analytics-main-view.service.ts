import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class LiveAnalyticsMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('LiveAnalyticsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.liveAnalytics
            && this._appPermissions.hasPermission(VMCPermissions.ANALYTICS_BASE)
            && this._appPermissions.hasPermission(VMCPermissions.FEATURE_LIVE_STREAM);
    }

    getRoutePath(): string {
        return 'analytics/liveAnalytics';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'analytics-live',
            title: this._appLocalization.get('app.titles.analyticsLivePageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsLiveMenuTitle')
        };
    }
}


