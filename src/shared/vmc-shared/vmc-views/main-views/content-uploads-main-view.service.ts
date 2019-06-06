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
export class ContentUploadsMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentUploadsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.CONTENT_INGEST_BASE,
            VMCPermissions.CONTENT_INGEST_UPLOAD,
            VMCPermissions.CONTENT_INGEST_BULK_UPLOAD
        ]);
    }

    getRoutePath(): string {
        return 'content/upload-control';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-uploads',
            title: this._appLocalization.get('app.titles.contentUploadsPageTitle'),
            menu: this._appLocalization.get('app.titles.contentUploadsMenuTitle')
        };
    }
}
