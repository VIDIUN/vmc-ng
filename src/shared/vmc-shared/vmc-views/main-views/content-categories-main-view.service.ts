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
export class ContentCategoriesMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentCategoriesMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.CONTENT_MANAGE_BASE,
            VMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES
            ]);
    }

    getRoutePath(): string {
        return 'content/categories';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-categories',
            title: this._appLocalization.get('app.titles.contentCategoriesPageTitle'),
            menu: this._appLocalization.get('app.titles.contentCategoriesMenuTitle')
        };
    }
}
