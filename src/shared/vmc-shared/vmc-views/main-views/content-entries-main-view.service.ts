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
export class ContentEntriesMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentEntriesMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.CONTENT_MANAGE_BASE,
            VMCPermissions.CONTENT_MANAGE_METADATA,
            VMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
            VMCPermissions.CONTENT_MANAGE_THUMBNAIL,
            VMCPermissions.CONTENT_MANAGE_SCHEDULE,
            VMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
            VMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
            VMCPermissions.CONTENT_MANAGE_EMBED_CODE,
            VMCPermissions.CONTENT_MANAGE_DELETE,
            VMCPermissions.CONTENT_MANAGE_RECONVERT
        ]);
    }

    getRoutePath(): string {
        return 'content/entries';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-entries',
            title: this._appLocalization.get('app.titles.contentEntriesPageTitle'),
            menu: this._appLocalization.get('app.titles.contentEntriesMenuTitle')
        };
    }
}
