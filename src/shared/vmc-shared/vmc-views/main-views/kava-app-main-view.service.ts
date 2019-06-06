import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserService } from 'shared/vmc-shell/providers/browser.service';
import { serverConfig } from 'config/server';
import { VmcMainViewBaseService, ViewMetadata } from 'app-shared/vmc-shared/vmc-views/vmc-main-view-base.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class KavaAppMainViewService extends VmcMainViewBaseService {

    constructor(private _appLocalization: AppLocalization,
                router: Router,
                browserService: BrowserService,
                titleService: Title,
                logger: VidiunLogger,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('KavaAppMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.kava;
    }

    getRoutePath(): string {
        return 'analytics/kava';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'analytics-kava',
            title: this._appLocalization.get('app.titles.analyticsKavaPageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsKavaMenuTitle')
        };
    }
}
