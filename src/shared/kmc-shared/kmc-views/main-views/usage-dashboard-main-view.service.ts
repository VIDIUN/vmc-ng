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
export class UsageDashboardMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('UsageDashboardMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.usageDashboard &&
            this._appPermissions.hasPermission(VMCPermissions.FEATURE_ENABLE_USAGE_DASHBOARD) &&
            this._appPermissions.hasPermission(VMCPermissions.ANALYTICS_BASE);
    }

    getRoutePath(): string {
        return 'usageDashboard';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'usage-dashboard',
            title: this._appLocalization.get('app.titles.usageDashboardPageTitle'),
            menu: this._appLocalization.get('app.titles.usageDashboardMenuTitle')
        };
    }
}


