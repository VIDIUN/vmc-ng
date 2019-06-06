import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';

@Component({
    selector: 'vPersistLoginByVs',
    template: '<v-area-blocker classes="vAreaBlockerCoverAll" [showLoader]="true"></v-area-blocker>',
    providers: [VidiunLogger.createLogger('PersistLoginByVsComponent')]
})
export class PersistLoginByVsComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _appAuth: AppAuthentication,
                private _browserService: BrowserService,
                private _logger: VidiunLogger) {
    }

    ngOnInit() {
        this._logger.info(`handle 'persist-login-by-vs' action`);
        const vs = (this._route.snapshot.params['vs'] || '').trim();
        if (!vs) {
            this._logger.info(`missing 'vs' value, navigating to default page`);
            this._browserService.navigateToDefault();
            return;
        }

        const replaceBrowserHistory = true;
        this._logger.info(`handle persist-login-by-vs by the user, navigating to default page`, { replaceBrowserHistory });

        this._appAuth.setAutomaticLoginCredentials(vs, true);
        this._browserService.navigateToDefault(replaceBrowserHistory);
    }

    ngOnDestroy() {
    }
}
