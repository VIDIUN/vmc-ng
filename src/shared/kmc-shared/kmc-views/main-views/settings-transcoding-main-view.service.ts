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
export class SettingsTranscodingMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsTranscodingMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.TRANSCODING_BASE,
            VMCPermissions.TRANSCODING_ADD,
            VMCPermissions.TRANSCODING_UPDATE,
            VMCPermissions.TRANSCODING_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/transcoding';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-transcoding',
            title: this._appLocalization.get('app.titles.settingsTranscodingPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsTranscodingRolesMenuTitle')
        };
    }
}
