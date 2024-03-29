import { Injectable, OnDestroy } from '@angular/core';
import { VidiunClient } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { TrackedFileStatuses, UploadManagement } from '@vidiun-ng/vidiun-common';
import { NewReplaceVideoUploadFile } from './new-replace-video-upload-file';
import { VidiunUploadedFileTokenResource } from 'vidiun-ngx-client';
import { VidiunAssetParamsResourceContainer } from 'vidiun-ngx-client';
import { VidiunAssetsParamsResourceContainers } from 'vidiun-ngx-client';
import { MediaUpdateContentAction } from 'vidiun-ngx-client';
import { UploadTokenDeleteAction } from 'vidiun-ngx-client';
import { TrackedFileData } from '@vidiun-ng/vidiun-common';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunUrlResource } from 'vidiun-ngx-client';
import { Subject } from 'rxjs/Subject';
import { MediaCancelReplaceAction } from 'vidiun-ngx-client';
import { BrowserService } from 'app-shared/vmc-shell';
import { VidiunRemoteStorageResource } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export interface VmcNewReplaceEntryLink {
    url: string;
    assetParamsId: number;
}

export interface VmcNewReplaceEntryUpload {
    file: File;
    assetParamsId: number;
}

export interface VmcNewReplaceEntryImport {
    url: string;
    assetParamsId: number;
}

@Injectable()
export class NewReplaceVideoUploadService implements OnDestroy {
    private _mediaUpdated = new Subject<string>();

    private _preparedFilesList: {
        [entryId: string]: {
            files: TrackedFileData[],
            count: number
        }
    } = {};

    constructor(private _vidiunServerClient: VidiunClient,
                private _uploadManagement: UploadManagement,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization,
                private _logger: VidiunLogger) {
        this._logger = _logger.subLogger('NewReplaceVideoUploadService');
        this._monitorTrackedFilesChanges();
    }

    ngOnDestroy() {
        this._mediaUpdated.complete();
    }

    private _monitorTrackedFilesChanges(): void {
        this._uploadManagement.onTrackedFileChanged$
            .pipe(cancelOnDestroy(this))
            .filter(trackedFile => trackedFile.data instanceof NewReplaceVideoUploadFile)
            .subscribe(
                trackedFile => {
                    switch (trackedFile.status) {
                        case TrackedFileStatuses.cancelled:
                            this._cancelReplacement(trackedFile);
                            break;
                        case TrackedFileStatuses.purged:
                            this._cleanupUpload(trackedFile);
                            break;
                        case TrackedFileStatuses.prepared:
                            this._updatePreparedFilesList(trackedFile);
                            break;
                        default:
                            break;
                    }
                }
            );
    }

    private _cancelReplacement(trackedFile: TrackedFileData): void {
        const entryId = (<NewReplaceVideoUploadFile>trackedFile.data).entryId;

        this._uploadManagement.getTrackedFiles()
            .filter(file => file.data instanceof NewReplaceVideoUploadFile && file.data.entryId === entryId)
            .forEach(file => this._cancelUpload(file));

        this._vidiunServerClient.request(new MediaCancelReplaceAction({ entryId }))
            .pipe(cancelOnDestroy(this))
            .pipe(tag('block-shell'))
            .subscribe(
                () => {
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message
                    });
                }
            );
    }

    private _updatePreparedFilesList(trackedFileData: TrackedFileData): void {
        const file = <NewReplaceVideoUploadFile>trackedFileData.data;
        const filesList = this._preparedFilesList[file.entryId];

        if (!filesList) {
            return;
        }

        filesList.files.push(trackedFileData);

        if (filesList.count === filesList.files.length) {
            this._updateMediaContent(file.entryId, filesList.files);
        }
    }

    private _cancelUpload(trackedFile: TrackedFileData): void {
        this._uploadManagement.cancelUpload(trackedFile.id, true);
    }

    private _cleanupUpload(trackedFile: TrackedFileData): void {
        const trackedFileData = <NewReplaceVideoUploadFile>trackedFile.data;

        if (trackedFileData.createMediaEntrySubscription instanceof Subscription) {
            trackedFileData.createMediaEntrySubscription.unsubscribe();
            trackedFileData.createMediaEntrySubscription = null;
        }

        if (trackedFileData.serverUploadToken) {
            this._removeUploadToken(trackedFileData.serverUploadToken)
                .subscribe(
                    () => {
                    },
                    (error) => {
                        this._logger.warn(this._formatError('Failed to remove upload token', error));
                    }
                );
        }
    }

    private _updateMediaContent(entryId: string, trackedFiles: TrackedFileData[]): void {
        const files = <NewReplaceVideoUploadFile[]>trackedFiles.map(({ data }) => data);
        const conversionProfileId = files[0].transcodingProfileId;
        const resource = new VidiunAssetsParamsResourceContainers({
            resources: files.map(file => {
                const subSubResource = new VidiunUploadedFileTokenResource({ token: file.serverUploadToken });
                return new VidiunAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: file.assetParamsId || 0 });
            })
        });

        this._vidiunServerClient.request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }))
            .subscribe(
                () => {
                    this._mediaUpdated.next(entryId);
                    delete this._preparedFilesList[entryId];
                },
                (error) => {
                    this._mediaUpdated.error(error);

                    trackedFiles.forEach(trackedFile => {
                        this._uploadManagement.cancelUploadWithError(trackedFile.id, this._formatError('Failed to create entry', error));
                    });
                }
            );
    }

    private _removeUploadToken(uploadTokenId: string): Observable<void> {
        return this._vidiunServerClient.request(new UploadTokenDeleteAction({ uploadTokenId }));
    }

    private _formatError(message: string, error: string | { message: string }): string {
        const errorMessage = typeof error === 'string' ? error : error && error.message ? error.message : 'unknown reason';
        return `${message}: ${errorMessage}`;
    }

    public upload(files: VmcNewReplaceEntryUpload[], entryId: string, flavorParamsId: number): Observable<string> {
        this._preparedFilesList[entryId] = { count: files.length, files: [] };

        this._uploadManagement.addFiles(
            files.map(file =>
                new NewReplaceVideoUploadFile(file.file, file.assetParamsId, flavorParamsId, entryId)
            )
        );

        return this._mediaUpdated.asObservable();
    }

    public import(files: VmcNewReplaceEntryImport[], entryId: string, conversionProfileId: number): Observable<void> {
        const resources = files.map(file => {
            return new VidiunAssetParamsResourceContainer({
                resource: new VidiunUrlResource({ url: file.url }),
                assetParamsId: file.assetParamsId || 0
            });
        });
        const resource = new VidiunAssetsParamsResourceContainers({ resources });

        return this._vidiunServerClient
            .request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }))
            .map(() => {
            });
    }

    public cancelUploadByEntryId(entryId: string): void {
        this._uploadManagement.getTrackedFiles()
            .filter(file => file.data instanceof NewReplaceVideoUploadFile && file.data.entryId === entryId)
            .forEach(file => this._cancelUpload(file));
    }

    public link(files: VmcNewReplaceEntryLink[], entryId: string, conversionProfileId: number, storageProfileId: number): Observable<void> {
        const resources = files.map(file => {
            return new VidiunAssetParamsResourceContainer({
                resource: new VidiunRemoteStorageResource({ url: file.url, storageProfileId }),
                assetParamsId: file.assetParamsId || 0
            });
        });
        const resource = new VidiunAssetsParamsResourceContainers({ resources });

        return this._vidiunServerClient
            .request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }))
            .map(() => {
            });
    }
}
