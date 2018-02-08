import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { serverConfig } from 'config/server';

@Component({
    selector: 'kAnalyticsLive',
    templateUrl: './analytics-live.component.html',
    styleUrls: ['./analytics-live.component.scss'],
    providers : []
})
export class AnalyticsLiveComponent implements OnInit, AfterViewInit, OnDestroy {

    public appUrl : string;

    constructor(private appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
        this.appUrl = `${serverConfig.externalApps.analytics.uri}?ks=${this.appAuthentication.appUser.ks}`;
    }

    ngAfterViewInit() {
    }


    ngOnDestroy() {

    }

}
