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

export interface QuizAppViewArgs {
    entry: VidiunMediaEntry;
    hasSource: boolean;
}

@Injectable()
export class QuizAppViewService extends VmcComponentViewBaseService<QuizAppViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _vidiunClient: VidiunClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: VidiunLogger) {
        super(_logger.subLogger('QuizAppViewService'));
    }

    isAvailable(args: QuizAppViewArgs): boolean {
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
        return false;
    }

    private _isAvailableByData(args: QuizAppViewArgs): boolean {
        const { entry, hasSource} = args;
        const entryReady = entry.status === VidiunEntryStatus.ready;
        const isEntryReplacing = entry.replacementStatus !== VidiunEntryReplacementStatus.none;
        const isLiveEntry = entry.mediaType === VidiunMediaType.liveStreamFlash ||
            entry.mediaType === VidiunMediaType.liveStreamWindowsMedia ||
            entry.mediaType === VidiunMediaType.liveStreamRealMedia ||
            entry.mediaType === VidiunMediaType.liveStreamQuicktime;
        const isExternalMedia = entry instanceof VidiunExternalMediaEntry;
        const isEntryRelevant = [VidiunMediaType.video, VidiunMediaType.audio].indexOf(entry.mediaType) !== -1 && !isExternalMedia;

        const result = hasSource && entryReady && !isEntryReplacing && isEntryRelevant && !isLiveEntry;

        this._logger.debug(`conditions used to check availability status by data`, () => (
            {
                result,
                hasSource,
                entryReady,
                isLiveEntry,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                isEntryRelevant
            }
        ));

        return result;
    }
}
