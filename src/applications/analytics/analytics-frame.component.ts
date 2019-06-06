import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router, NavigationEnd, Params } from '@angular/router';
import { AppAuthentication } from 'shared/vmc-shell/index';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { serverConfig } from 'config/server';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { BrowserService } from 'app-shared/vmc-shell';
import { Location } from '@angular/common';
import { VmcLoggerConfigurator } from 'app-shared/vmc-shell/vmc-logs/vmc-logger-configurator';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
    selector: 'vAnalyticsFrame',
    template: '<span *ngIf="!_initialized" class="vLoading">Loading...</span><iframe #analyticsFrame frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100%; border: 0px; transition: height 0.3s; }',
        '.vLoading { display: block; padding: 12px; font-size: 16px; }'
    ],
    providers: [VidiunLogger.createLogger('AnalyticsFrameComponent')]
})
export class AnalyticsFrameComponent implements OnInit, OnDestroy {

    @ViewChild('analyticsFrame') analyticsFrame: ElementRef;
    public _windowEventListener = null;
    public _url = null;
    public _initialized = false;
    private _lastNav = '';
    private _currentAppUrl: string;
    private _lastQueryParams: { [key: string]: string }[] = null;
    private _analyticsDefaultPage = '/analytics/engagement';

    constructor(private appAuthentication: AppAuthentication,
                private logger: VidiunLogger,
                private router: Router,
                private _browserService: BrowserService,
                private renderer: Renderer2,
                private _permissions: VMCPermissionsService,
                private _loggerConfigurator: VmcLoggerConfigurator,
    ) {
        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd)  {
                    const { url, queryParams } = this._browserService.getUrlWithoutParams(event.urlAfterRedirects);
                    if (this._currentAppUrl !== url) {
                        this.updateLayout(window.innerHeight - 54);
                        this._currentAppUrl = url;
                        if (this._initialized) {
                            this.sendMessageToAnalyticsApp({'messageType': 'navigate', payload: { url }});
                            this.sendMessageToAnalyticsApp({'messageType': 'updateFilters', payload: { queryParams }});
                        } else {
                            this._lastQueryParams = queryParams;
                            this._lastNav = url;
                        }
                    }
                }
            });

        this.sendMessageToAnalyticsApp({'messageType': 'setLogsLevel', payload: { level: this._loggerConfigurator.currentLogLevel }});
    }

    private sendMessageToAnalyticsApp(message: any): void{
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow && this.analyticsFrame.nativeElement.contentWindow.postMessage){
            this.analyticsFrame.nativeElement.contentWindow.postMessage(message, window.location.origin);
        }
    }

    private _scrollTo(position: string): void {
        const offset = 50;
        const intPosition = parseInt(position, 10);
        if (!isNaN(intPosition)) {
            this._browserService.scrollTo(intPosition + offset);
        }
    }

    private _updateUrl(): void {
        this._url = serverConfig.externalApps.vmcAnalytics.uri;
    }

    ngOnInit() {
        // set analytics config
        const config = {
            vidiunServer: {
                uri : serverConfig.vidiunServer.uri,
                previewUIConf: serverConfig.vidiunServer.previewUIConf
            },
            cdnServers: serverConfig.cdnServers,
            liveAnalytics: serverConfig.externalApps.liveAnalytics,
            vs: this.appAuthentication.appUser.vs,
            pid: this.appAuthentication.appUser.partnerId,
            locale: 'en',
            permissions: {
                lazyLoadCategories: this._permissions.hasPermission(VMCPermissions.DYNAMIC_FLAG_VMC_CHUNKED_CATEGORY_LOAD)
            }
        };

        try {
            this._updateUrl();
        } catch (ex) {
            this.logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['analyticsConfig'] = null;
        }

        this._windowEventListener = (e) => {
            let postMessageData;
            try {
                postMessageData = e.data;
            } catch (ex) {
                return;
            }

            if (postMessageData.messageType === 'analytics-init') {
                this.sendMessageToAnalyticsApp({'messageType': 'init', 'payload': config });
            };
            if (postMessageData.messageType === 'analytics-init-complete') {
                this._initialized = true;
                this.sendMessageToAnalyticsApp({'messageType': 'navigate', 'payload': { 'url': this._lastNav }});
                this.sendMessageToAnalyticsApp({'messageType': 'updateFilters', 'payload': { 'queryParams': this._lastQueryParams }});
                this._lastNav = '';
                this._lastQueryParams = null;
            };
            if (postMessageData.messageType === 'logout') {
                this.logout();
            };
            if (postMessageData.messageType === 'updateLayout') {
                this.updateLayout(postMessageData.payload.height);
            };
            if (postMessageData.messageType === 'navigate') {
                this._updateQueryParams(postMessageData.payload);
            }
            if (postMessageData.messageType === 'navigateTo') {
                this.router.navigateByUrl(postMessageData.payload);
            }
            if (postMessageData.messageType === 'scrollTo') {
                this._scrollTo(postMessageData.payload);
            }
            if (postMessageData.messageType === 'entryNavigateBack') {
                this._navigateBack();
            }
            if (postMessageData.messageType === 'modalOpened') {
                this._modalToggle(true);
            }
            if (postMessageData.messageType === 'modalClosed') {
                this._modalToggle(false);
            }
        };
        this._addPostMessagesListener();
    }

    ngOnDestroy() {
        this._url = null;
        this._removePostMessagesListener();
    }

    private _modalToggle(opened: boolean): void {
        const appMenu = document.querySelector('#appMenu') as HTMLElement;
        const menuCover = document.querySelector('.vMenuCover') as HTMLElement;
        if (!appMenu || !menuCover) {
            return;
        }

        if (opened) {
            document.body.classList.add('vModal');
            menuCover.style.display = 'block';
            menuCover.style.height = `${appMenu.offsetHeight}px`;
        } else {
            document.body.classList.remove('vModal');
            menuCover.style.display = 'none';
        }
    }

    private _navigateBack(): void {
        if (!!this._browserService.previousRoute) {
            this.router.navigateByUrl(this._browserService.previousRoute.url);
        } else {
            this.router.navigateByUrl(this._analyticsDefaultPage);
        }
    }

    private _updateQueryParams(queryParams: Params): void {
        const urlTree = this.router.parseUrl(this.router.url);
        urlTree.queryParams = queryParams;
        this.router.navigateByUrl(urlTree);
    }

    private logout(): void {
        this.appAuthentication.logout();
    }

    private updateLayout(newHeight: number): void {
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow) {
            this.renderer.setStyle(this.analyticsFrame.nativeElement, 'height', newHeight + 'px');
        }
    }

    private _addPostMessagesListener() {
        this._removePostMessagesListener();
        window.addEventListener('message', this._windowEventListener);
    }

    private _removePostMessagesListener(): void {
        window.removeEventListener('message', this._windowEventListener);
    }

}
