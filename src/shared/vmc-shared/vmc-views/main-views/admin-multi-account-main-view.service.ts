import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class AdminMultiAccountMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('AdminMultiAccountMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(VMCPermissions.ADMIN_BASE) && this._appPermissions.hasPermission(VMCPermissions.FEATURE_VAR_CONSOLE_LOGIN);
    }

    getRoutePath(): string {
        return 'administration/multi-account';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'admin-multi-account',
            title: this._appLocalization.get('app.titles.administrationMultiAccountPageTitle'),
            menu: this._appLocalization.get('app.titles.administrationMultiAccountMenuTitle')
        };
    }
}
