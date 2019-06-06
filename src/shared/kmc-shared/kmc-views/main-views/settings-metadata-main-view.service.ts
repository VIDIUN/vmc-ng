import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class SettingsMetadataMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsMetadataMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.CUSTOM_DATA_PROFILE_BASE,
            VMCPermissions.CUSTOM_DATA_PROFILE_ADD,
            VMCPermissions.CUSTOM_DATA_PROFILE_UPDATE,
            VMCPermissions.CUSTOM_DATA_PROFILE_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/metadata';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-metadata',
            title: this._appLocalization.get('app.titles.settingsMetadataPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsMetadataMenuTitle')
        };
    }
}
