import { Component, OnDestroy } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcMainViewsService } from 'app-shared/vmc-shared/vmc-views';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';

@Component({
    selector: 'app-default-view',
    templateUrl: './app-default-view.component.html',
    styleUrls: ['./app-default-view.component.scss'],
    providers: [
        VidiunLogger.createLogger('AppDefaultViewComponent')
    ],
})
export class AppDefaultViewComponent implements OnDestroy {
    constructor(
        private _logger: VidiunLogger,
        private _browserService: BrowserService,
        private _appAuthentication: AppAuthentication,
        private _appLocalization: AppLocalization,
        private _viewsManager: VmcMainViewsService) {
        this.navigateToDefault();
    }

    ngOnDestroy() {}

    navigateToDefault() {
        this._appAuthentication.loginAutomatically(null)
            .pipe(cancelOnDestroy(this))
            .subscribe(result => {
                if (result) {
                    const menu = this._viewsManager.getMenu();
                    const firstItem = menu && menu.length ? menu[0] : null;

                    if (firstItem && firstItem.isAvailable) {
                        this._logger.info(`navigate to first available view`, { viewTitle: firstItem.menuTitle });
                        firstItem.open();
                    } else {
                        this._logger.warn(`cannot find available view to navigate to`);
                        this._browserService.navigateToError();
                    }
                } else {
                    this._logger.info(`navigate to login page`);
                    this._browserService.navigateToLogin();
                }
            });
    }
}
