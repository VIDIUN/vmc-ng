import { Injectable } from '@angular/core';
import { serverConfig } from 'config/server';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class ServicesDashboardMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ServicesDashboardMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        const reachIsAvailable = !!serverConfig.externalApps.reach;
        return reachIsAvailable && this._appPermissions.hasPermission(VMCPermissions.REACH_PLUGIN_PERMISSION);
    }

    getRoutePath(): string {
        return 'servicesDashboard';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'services-dashboard',
            title: this._appLocalization.get('app.titles.reachDashboardPageTitle'),
            menu: this._appLocalization.get('app.titles.reachDashboardMenuTitle')
        };
    }
}


