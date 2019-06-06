import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/vmc-shell/index';
import { buildCDNUrl, getVidiunServerUri, serverConfig } from 'config/server';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { LiveAnalyticsMainViewService } from '../vmc-views/main-views/live-analytics-main-view.service';

@Component({
    selector: 'vAnalyticsLiveFrame',
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [VidiunLogger.createLogger('AnalyticsLiveFrameComponent')]
})
export class AnalyticsLiveFrameComponent implements OnInit, OnDestroy, OnChanges {
    @Input() entryId: string;

    public _url = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: VidiunLogger,
                private browserService: BrowserService,
                private _liveAnalyticsView: LiveAnalyticsMainViewService
    ) {
    }

    ngOnChanges(changes) {
        if (changes.entryId) {
            this._updateUrl();
        }
    }

    private _updateUrl(): void {
        if (this.entryId) {
            this._url = serverConfig.externalApps.liveAnalytics.uri + `#/entry/${this.entryId}/nonav`;
        } else {
            this._url = serverConfig.externalApps.liveAnalytics.uri + '#/dashboard/nonav';
        }
    }

    ngOnInit() {
        try {
            if (!this._liveAnalyticsView.isAvailable()) {
                this.browserService.handleUnpermittedAction(true);
                return undefined;
            }

            this._updateUrl();

            let cdn_host = buildCDNUrl('');
            cdn_host = cdn_host.substr(cdn_host.indexOf('://')+3); // remove protocol as Live Analytivs app adds it itself
            window['vmc'] = {
                'vars': {
                    'vs': this.appAuthentication.appUser.vs,
                    'partner_id': this.appAuthentication.appUser.partnerId,
                    'cdn_host':  cdn_host,
                    'service_url': getVidiunServerUri(),
                    'liveanalytics': {
                        'player_id': +serverConfig.externalApps.liveAnalytics.uiConfId || '',
                        map_urls: serverConfig.externalApps.liveAnalytics.mapUrls || [],
                        map_zoom_levels: serverConfig.externalApps.liveAnalytics.mapZoomLevels || ''
                    }
                },
                'functions': {
                    expired: () => {
                        this.appAuthentication.logout();
                    }
                }
            };
        } catch (ex) {
            this.logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['vmc'] = null;
        }
    }

    ngOnDestroy() {
        this._url = null;
        window['vmc'] = null;
    }
}
