import { Injectable } from '@angular/core';
import { VMCPermissionsService } from '../../vmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcComponentViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-component-view-base.service';
import { serverConfig } from 'config/server';

@Injectable()
export class LiveDashboardAppViewService extends VmcComponentViewBaseService<void> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _vidiunClient: VidiunClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: VidiunLogger) {
        super(_logger.subLogger('LiveDashboardAppViewService'));
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.liveDashboard;
    }
}
