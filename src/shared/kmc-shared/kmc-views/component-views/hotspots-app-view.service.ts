import { Injectable } from '@angular/core';
import { VMCPermissionsService, VMCPermissions } from '../../vmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VmcComponentViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-component-view-base.service';
import { serverConfig } from 'config/server';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import {VidiunEntryStatus} from 'vidiun-ngx-client';
import {VidiunEntryReplacementStatus} from 'vidiun-ngx-client';
import {VidiunExternalMediaEntry} from 'vidiun-ngx-client';
import {VidiunMediaType} from 'vidiun-ngx-client';
import { VidiunLiveEntry } from 'vidiun-ngx-client';

export interface HotspotsAppViewArgs {
    entry: VidiunMediaEntry | VidiunLiveEntry;
    hasSource: boolean;
}

@Injectable()
export class HotspotsAppViewService extends VmcComponentViewBaseService<HotspotsAppViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _vidiunClient: VidiunClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: VidiunLogger) {
        super(_logger.subLogger('HotspotsAppViewService'));
    }

    isAvailable(args: HotspotsAppViewArgs): boolean {
        const availableByConfiguration = !!serverConfig.externalApps.editor;
        const availableByPermissions = this._isAvailableByPermission();
        const availableByData = this._isAvailableByData(args);
        const result = availableByConfiguration && availableByData && availableByPermissions;
        this._logger.info(
            `handle isAvailable action`,
            {
                availableByConfiguration,
                availableByPermissions,
                availableByData,
                result
            }
        );
        return result;
    }

    private _isAvailableByPermission(): boolean {
        return true;
    }

    private _isAvailableByData(args: HotspotsAppViewArgs): boolean {
        const { entry, hasSource} = args;
        const entryReady = entry.status === VidiunEntryStatus.ready;
        const isEntryReplacing = entry.replacementStatus !== VidiunEntryReplacementStatus.none;
        const isExternalMedia = entry instanceof VidiunExternalMediaEntry;
        const isEntryRelevant = [VidiunMediaType.video].indexOf(entry.mediaType) !== -1 && !isExternalMedia;
        const isLiveEntry = [
            VidiunMediaType.liveStreamFlash,
            VidiunMediaType.liveStreamWindowsMedia,
            VidiunMediaType.liveStreamRealMedia,
            VidiunMediaType.liveStreamQuicktime
        ].indexOf(entry.mediaType) !== -1;
        const isAvailableForMedia = !isLiveEntry && isEntryRelevant && hasSource && entryReady && !isEntryReplacing;
        const result = isAvailableForMedia;

        this._logger.trace(`conditions used to check availability status by data`, () => (
            {
                result,
                entryReady,
                hasSource,
                isLiveEntry,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                isEntryRelevant,
                isAvailableForMedia
            }
        ));

        return result;
    }


}
