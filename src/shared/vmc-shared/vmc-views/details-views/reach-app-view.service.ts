import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserService } from 'shared/vmc-shell/providers/browser.service';
import { VidiunCategory, VidiunEntryStatus, VidiunExternalMediaEntry, VidiunMediaEntry, VidiunMediaType } from 'vidiun-ngx-client';
import { serverConfig } from 'config/server';
import { VMCPermissions, VMCPermissionsService } from 'shared/vmc-shared/vmc-permissions/index';
import { DetailsViewMetadata, VmcDetailsViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-details-view-base.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';
import { Title } from '@angular/platform-browser';
import { AppEventsService } from 'app-shared/vmc-shared/app-events';
import { CaptionRequestEvent } from 'app-shared/vmc-shared/events';
import { Observable, of as ObservableOf } from 'rxjs';

export enum ReachPages {
    entry = 'entry',
    entries = 'entries',
    category = 'category',
    dashboard = 'dashboard'
}

export interface ReachAppViewArgs {
    entry?: VidiunMediaEntry;
    entries?: VidiunMediaEntry[];
    category?: VidiunCategory;
    page: ReachPages;
}

@Injectable()
export class ReachAppViewService extends VmcDetailsViewBaseService<ReachAppViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                private _appEvents: AppEventsService,
                _browserService: BrowserService,
                _logger: VidiunLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('ReachAppViewService'), _browserService,
            _titleService, _contextualHelpService);
    }

    private _availableByPermission(args: ReachAppViewArgs): boolean {
        let _available: boolean = this._appPermissions.hasPermission(VMCPermissions.REACH_PLUGIN_PERMISSION);
        if (args.page === ReachPages.category) {
            _available = _available && this._appPermissions.hasPermission(VMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES);
        } else if (args.page === ReachPages.entry || args.page === ReachPages.entries){
            _available = _available && this._appPermissions.hasPermission(VMCPermissions.CAPTION_MODIFY);
        }
        return _available;
    }

    private _availableByData(args: ReachAppViewArgs): boolean {
        switch (args.page) {
            case ReachPages.entry:
                return this.isRelevantEntry(args.entry);
            case ReachPages.entries:
            case ReachPages.dashboard:
                return true; // since we build bulk actions menu before entries are selected, always allow by data
            case ReachPages.category:
                return args.category instanceof VidiunCategory;
            default:
                return false;
        }
    }

    public isRelevantEntry(entry: VidiunMediaEntry): boolean {
        if (entry) {
            const isVideoAudio = entry.mediaType === VidiunMediaType.video || entry.mediaType === VidiunMediaType.audio;
            const isReady = entry.status === VidiunEntryStatus.ready;
            return isReady && isVideoAudio;
        }
        return false;
    }

    protected _open(args: ReachAppViewArgs): Observable<boolean> {
        this._logger.info('handle open view request by the user', { page: args.page });
        const page = args.page;
        delete args.page;
        this._appEvents.publish(new CaptionRequestEvent(args, page));
        return ObservableOf(true);
    }

    public isAvailable(args: ReachAppViewArgs): boolean {
        const isAvailableByConfig = !!serverConfig.externalApps.reach;
        const isAvailableByPermission = this._availableByPermission(args);
        const isAvailableByData = this._availableByData(args);

        return isAvailableByConfig && isAvailableByData && isAvailableByPermission;
    }

    public getViewMetadata(args: ReachAppViewArgs): DetailsViewMetadata {
        return { title: '', viewKey: '' };
    }
}
