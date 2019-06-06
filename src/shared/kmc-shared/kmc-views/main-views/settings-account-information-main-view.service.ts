import { Injectable } from '@angular/core';
import { VmcMainViewBaseService, ViewMetadata } from '../vmc-main-view-base.service';
import { Router } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class SettingsAccountInformationMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsAccountInformationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return true;
    }

    getRoutePath(): string {
        return 'settings/accountInformation';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-account-info',
            title: this._appLocalization.get('app.titles.settingsAccountInfoPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsAccountInfoMenuTitle')
        };
    }
}
