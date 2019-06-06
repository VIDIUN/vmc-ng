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
export class ContentPlaylistsMainViewService extends VmcMainViewBaseService {

    constructor(
        logger: VidiunLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: VMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentPlaylistsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            VMCPermissions.PLAYLIST_BASE,
            VMCPermissions.PLAYLIST_ADD,
            VMCPermissions.PLAYLIST_UPDATE,
            VMCPermissions.PLAYLIST_DELETE,
            VMCPermissions.PLAYLIST_EMBED_CODE
        ]);
    }

    getRoutePath(): string {
        return 'content/playlists';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-playlists',
            title: this._appLocalization.get('app.titles.contentPlaylistsPageTitle'),
            menu: this._appLocalization.get('app.titles.contentPlaylistsMenuTitle')
        };
    }
}
