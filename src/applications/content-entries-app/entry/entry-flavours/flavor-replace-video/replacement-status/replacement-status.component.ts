import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { EntryFlavoursWidget, ReplacementData } from '../../entry-flavours-widget.service';
import { VidiunEntryReplacementStatus } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { NewReplaceVideoUploadService } from 'app-shared/vmc-shell/new-replace-video-upload';
import { UploadManagement } from '@vidiun-ng/vidiun-common';
import { NewReplaceVideoUploadFile } from 'app-shared/vmc-shell/new-replace-video-upload/new-replace-video-upload-file';
import { TrackedFileStatuses } from '@vidiun-ng/vidiun-common';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum FlavorsTabs {
    current = 'current',
    replacement = 'replacement'
}

@Component({
    selector: 'vFlavorReplaceMediaStatus',
    templateUrl: './replacement-status.component.html',
    styleUrls: ['./replacement-status.component.scss'],
    providers: [VidiunLogger.createLogger('ReplacementStatusComponent')]
})
export class ReplacementStatusComponent implements OnInit, OnDestroy {
    @Input() entry: VidiunMediaEntry;
    @Input() currentEntryId: string;
    @Input() replacementData: ReplacementData;
    @Input() replaceButtonsLabel: string;

    private _failedUploadingFiles: { [id: string]: boolean } = {};

    public _flavorsTabs = FlavorsTabs;
    public _currentTab = FlavorsTabs.current;

    public get _replacementUploadFailed() {
        return Object
            .keys(this._failedUploadingFiles)
            .map(key => this._failedUploadingFiles[key])
            .some(Boolean);
    }

    public get _approveBtnDisabled(): boolean {
        return this.replacementData.status === VidiunEntryReplacementStatus.approvedButNotReady
            || this.replacementData.status === VidiunEntryReplacementStatus.failed;
    }

    public get _approveBtnLabel(): string {
        return this.replacementData.status === VidiunEntryReplacementStatus.approvedButNotReady
            ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.autoReplacement')
            : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.approveReplacement');
    }

    constructor(private _widgetService: EntryFlavoursWidget,
                private _appLocalization: AppLocalization,
                private _logger: VidiunLogger,
                private _uploadManagement: UploadManagement,
                private _newReplaceVideoUpload: NewReplaceVideoUploadService) {
        this._monitorTrackedFilesChanges();
    }

    ngOnInit() {
        this._currentTab = this.entry.id === this.currentEntryId ? FlavorsTabs.current : FlavorsTabs.replacement;
    }

    ngOnDestroy() {

    }

    private _monitorTrackedFilesChanges(): void {
        this._uploadManagement.onTrackedFileChanged$
            .pipe(cancelOnDestroy(this))
            .filter(trackedFile =>
                trackedFile.data instanceof NewReplaceVideoUploadFile
                && trackedFile.data.entryId === this.entry.id
            )
            .subscribe(trackedFile => {
                switch (trackedFile.status) {
                    case TrackedFileStatuses.failure:
                        this._failedUploadingFiles[trackedFile.id] = true;
                        break;
                    case TrackedFileStatuses.purged:
                        delete this._failedUploadingFiles[trackedFile.id];
                        break;
                    default:
                        this._failedUploadingFiles[trackedFile.id] = false;
                        break;
                }
            });
    }
    public _cancelReplacement(): void {
        this._logger.info(`handle cancel replacement action by user`, { entryId: this.entry.id });
        this._widgetService.cancelReplacement();
        this._newReplaceVideoUpload.cancelUploadByEntryId(this.entry.id);
    }

    public _approveReplacement(): void {
        this._logger.info(`handle approve replacement action by user`, { entryId: this.entry.id });
        this._widgetService.approveReplacement();
    }

    public _selectFlavorsTab(tab: FlavorsTabs): void {
        this._logger.info(`handle change flavors tab action by user`, { tab, entryId: this.entry.id });
        const entryId = tab === FlavorsTabs.replacement ? this.replacementData.tempEntryId : this.entry.id;

        if (entryId) {
            this._currentTab = tab;
            this._widgetService.loadFlavorsByEntryId(entryId);
        } else {
            this._logger.warn('no entryId abort action');
        }
    }
}

