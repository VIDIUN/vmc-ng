import { Injectable } from '@angular/core';
import {
    EntryWidget
} from '../entry-widget';
import { VidiunClient } from 'vidiun-ngx-client';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunSourceType } from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class EntryDetailsWidget extends EntryWidget
{
    public _landingPage : string;

    constructor(
                vidiunServerClient: VidiunClient,
                private appAuthentication: AppAuthentication,
                logger: VidiunLogger)

    {
        super('entryDetails', logger);
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {

    }

    protected onActivate(firstTimeActivating: boolean) {
        const entry: VidiunMediaEntry = this.data;

	    this._landingPage = null;

        let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
	        landingPage = landingPage.replace("{entryId}", entry.id);
	        if (landingPage.indexOf("http") !== 0){
	            landingPage = "http://" + landingPage;
            }
        }
        this._landingPage = landingPage;
    }
}
