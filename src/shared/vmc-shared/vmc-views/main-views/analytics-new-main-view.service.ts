import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class AnalyticsNewMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('AnalyticsNewMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.vmcAnalytics
            && this._appPermissions.hasPermission(VMCPermissions.ANALYTICS_BASE)
            && !this._appPermissions.hasPermission(VMCPermissions.FEATURE_NEW_ANALYTICS_TAB_DISABLE);
    }

    getRoutePath(): string {
        return 'analytics';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'analytics',
            title: this._appLocalization.get('app.titles.analyticsPageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsMenuTitle')
        };
    }
}


