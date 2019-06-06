import {Injectable, OnDestroy} from '@angular/core';
import {AppAuthentication} from 'app-shared/vmc-shell';
import {VidiunSourceType} from 'vidiun-ngx-client';
import {PreviewMetadataChangedEvent} from '../../preview-metadata-changed-event';
import {AppEventsService} from 'app-shared/vmc-shared';
import {EntryWidget} from '../entry-widget';
import {serverConfig, getVidiunServerUri} from 'config/server';
import {VMCPermissions, VMCPermissionsService} from 'app-shared/vmc-shared/vmc-permissions';
import { EntryStore } from '../entry-store.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class EntryPreviewWidget extends EntryWidget implements OnDestroy {
    public _iframeSrc: string;
    private _urlHash: number = 0;

    constructor(private appAuthentication: AppAuthentication,
                private _store: EntryStore,
                private _permissionsService: VMCPermissionsService,
                appEvents: AppEventsService,
                logger: VidiunLogger) {
        super('entryPreview', logger);


        appEvents.event(PreviewMetadataChangedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({entryId}) => {
                if (this.data && this.data.id === entryId) {
                    this._iframeSrc = this._createUrl();
                }
            });
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
        // DEVELOPER NOTICE: don't reset _urlHash to support refresh after saving
    }

    ngOnDestroy() {
    }

    private _createUrl(): string {

        let result = "";

        // create preview embed code
        if (this.data) {
            const entryId = this.data.id;
            const sourceType = this.data.sourceType.toString();
            const isLive = (sourceType === VidiunSourceType.liveStream.toString() ||
                sourceType === VidiunSourceType.akamaiLive.toString() ||
                sourceType === VidiunSourceType.akamaiUniversalLive.toString() ||
                sourceType === VidiunSourceType.manualLiveStream.toString());

            const UIConfID = serverConfig.vidiunServer.previewUIConf;
            const partnerID = this.appAuthentication.appUser.partnerId;
            const vs = this.appAuthentication.appUser.vs || "";
            const serverUri = getVidiunServerUri();

            let flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[closedCaptions.hideWhenEmpty]=true&flashvars[vs]=${vs}`;
            if (isLive) {
                flashVars += '&flashvars[disableEntryRedirect]=true';
            }
            const shouldDisableAlerts = this._permissionsService.hasPermission(VMCPermissions.FEATURE_DISABLE_VMC_VDP_ALERTS);
            if (shouldDisableAlerts) {
                flashVars += '&flashvars[disableAlerts]=true';
            }

            this._urlHash = this._urlHash + 1;

            result = `${serverUri}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&${flashVars}&entry_id=${entryId}&hash=${this._urlHash}`;
        }

        return result;
    }

    protected onActivate(firstTimeActivating: boolean) {
        this._iframeSrc = this._createUrl();
    }


}
