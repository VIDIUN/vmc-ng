import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VmcMainViewBaseService } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { ViewMetadata } from 'app-shared/vmc-shared/vmc-views/vmc-main-view-base.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class AdminUsersMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('AdminUsersMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(VMCPermissions.ADMIN_BASE) && this._appPermissions.hasAnyPermissions([
            VMCPermissions.ADMIN_USER_ADD,
            VMCPermissions.ADMIN_USER_UPDATE,
            VMCPermissions.ADMIN_USER_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'administration/users/list';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'admin-users',
            title: this._appLocalization.get('app.titles.administrationUsersPageTitle'),
            menu: this._appLocalization.get('app.titles.administrationUsersMenuTitle')
        };
    }
}
