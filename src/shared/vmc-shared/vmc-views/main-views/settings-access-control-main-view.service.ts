import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router, NavigationEnd } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class SettingsAccessControlMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsAccessControlMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.ACCESS_CONTROL_BASE,
            VMCPermissions.ACCESS_CONTROL_ADD,
            VMCPermissions.ACCESS_CONTROL_UPDATE,
            VMCPermissions.ACCESS_CONTROL_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/accessControl';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-access-control',
            title: this._appLocalization.get('app.titles.settingsAccessControlPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsAccessControlMenuTitle')
        };
    }
}
