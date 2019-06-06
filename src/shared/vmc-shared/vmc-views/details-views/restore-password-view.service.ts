import { Injectable } from '@angular/core';
import { VMCPermissionsService } from '../../vmc-permissions';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {
    DetailsViewMetadata,
    VmcDetailsViewBaseService
} from 'app-shared/vmc-shared/vmc-views/vmc-details-view-base.service';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

export interface RestorePasswordViewArgs {
    hash: string;
}


@Injectable()
export class RestorePasswordViewService extends VmcDetailsViewBaseService<RestorePasswordViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                _browserService: BrowserService,
                _logger: VidiunLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('RestorePasswordViewService'), _browserService,
            _titleService, _contextualHelpService);
    }

    getViewMetadata(args: RestorePasswordViewArgs): DetailsViewMetadata {
        const title = this._appLocalization.get('app.titles.restorePasswordPageTitle');
        return {
            title,
            viewKey: 'restore-password'
        };
    }
    isAvailable(args: RestorePasswordViewArgs): boolean {
        const hasHash = args && !!args.hash;
        this._logger.info(`handle isAvailable action by user`, { hasHash });
        return hasHash;
    }

    protected _open(args: RestorePasswordViewArgs): Observable<boolean> {
        this._logger.info('handle open view request by the user', {hash: args.hash});
        return this._browserService.navigateToLoginWithStatus();
    }
}
