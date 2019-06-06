import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunPartnerStatistics } from 'vidiun-ngx-client';
import { PartnerGetStatisticsAction } from 'vidiun-ngx-client';
import { serverConfig } from 'config/server';

@Injectable()
export class SettingsAccountInformationService {

    constructor(private _http: HttpClient, private _vidiunServerClient: VidiunClient) {
    }

    public canContactSalesForceInformation(): boolean {
        try {
            return !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.contactSalesforce;
        } catch (ex) {
            return false;
        }
    }

    public sendContactSalesForceInformation(data: string): Observable<void> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        };
        try {
            return this._http
                .post(serverConfig.externalLinks.vidiun.contactSalesforce, data, httpOptions)
                .map(() => undefined);
        } catch (ex) {
            return Observable.throw(new Error('An error occurred while trying to contact SalesForce'));
        }
    }

    public getStatistics(): Observable<VidiunPartnerStatistics> {
        return this._vidiunServerClient.request(new PartnerGetStatisticsAction());
    }
}
