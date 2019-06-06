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
export class ContentSyndicationMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentSyndicationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.SYNDICATION_BASE,
            VMCPermissions.SYNDICATION_ADD,
            VMCPermissions.SYNDICATION_UPDATE,
            VMCPermissions.SYNDICATION_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'content/syndication';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-syndication',
            title: this._appLocalization.get('app.titles.contentSyndicationPageTitle'),
            menu: this._appLocalization.get('app.titles.contentSyndicationMenuTitle')
        };
    }
}
