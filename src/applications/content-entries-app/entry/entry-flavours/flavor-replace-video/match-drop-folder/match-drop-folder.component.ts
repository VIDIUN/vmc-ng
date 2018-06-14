import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaClient, KalturaRequestOptions } from 'kaltura-ngx-client';
import { TranscodingProfileManagement } from 'app-shared/kmc-shared/transcoding-profile-management';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { DropFolderListAction } from 'kaltura-ngx-client/api/types/DropFolderListAction';
import { KalturaDropFolderFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFilter';
import { KalturaDropFolderOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderOrderBy';
import { KalturaDropFolderStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderStatus';
import { KalturaDropFolderContentFileHandlerConfig } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerConfig';
import { KalturaDropFolder } from 'kaltura-ngx-client/api/types/KalturaDropFolder';
import { KalturaDropFolderContentFileHandlerMatchPolicy } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerMatchPolicy';
import { KalturaDropFolderFileHandlerType } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileHandlerType';
import { Observable } from 'rxjs/Observable';
import { SelectItem } from 'primeng/api';
import { DropFolderFileListAction } from 'kaltura-ngx-client/api/types/DropFolderFileListAction';
import { KalturaDropFolderFileFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileFilter';
import { KalturaDropFolderFileOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileOrderBy';
import { KalturaDropFolderFileStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileStatus';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { BaseEntryUpdateAction } from 'kaltura-ngx-client/api/types/BaseEntryUpdateAction';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-ngx-client/api/types/KalturaAssetsParamsResourceContainers';
import { KalturaDropFolderFileResource } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-ngx-client/api/types/KalturaAssetParamsResourceContainer';
import { KalturaConversionProfileAssetParamsFilter } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParamsFilter';
import { ConversionProfileAssetParamsListAction } from 'kaltura-ngx-client/api/types/ConversionProfileAssetParamsListAction';
import { KalturaConversionProfileFilter } from 'kaltura-ngx-client/api/types/KalturaConversionProfileFilter';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaConversionProfileOrderBy } from 'kaltura-ngx-client/api/types/KalturaConversionProfileOrderBy';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { MediaUpdateContentAction } from 'kaltura-ngx-client/api/types/MediaUpdateContentAction';
import { EntryFlavoursWidget } from '../../entry-flavours-widget.service';

export interface KalturaDropFolderFileGroup extends KalturaDropFolderFile {
    files?: KalturaDropFolderFile[];
    name?: string;
    displayName?: string;
    error?: boolean;
}

@Component({
    selector: 'kReplaceMatchDropFolder',
    templateUrl: './match-drop-folder.component.html',
    styleUrls: ['./match-drop-folder.component.scss'],
    providers: [KalturaLogger.createLogger('MatchDropFolderComponent')]
})
export class MatchDropFolderComponent implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() entry: KalturaMediaEntry;

    private _dropFoldersList: KalturaDropFolder[] = [];
    private _conversionProfilesList: { id: number, assets: KalturaConversionProfileAssetParams[] }[] = [];

    public _isLoading = false;
    public _blockerMessage: AreaBlockerMessage;
    public _dropFoldersListOptions: SelectItem[] = [];
    public _selectedDropFolder: number = null;
    public _dropFolderFiles: KalturaDropFolderFileGroup[] = [];
    public _selectedFile: KalturaDropFolderFileGroup;

    public get _setReferenceIdEnabled(): boolean {
        return this._selectedFile
            && this._selectedFile.status !== KalturaDropFolderFileStatus.waiting
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_REFERENCE_MODIFY)
            && !!this._dropFoldersListOptions.length;
    }

    public get _addFilesEnabled(): boolean {
        return this._selectedFile
            && this._selectedFile.status !== KalturaDropFolderFileStatus.waiting
            && !!this._dropFoldersListOptions.length;
    }

    constructor(private _kalturaClient: KalturaClient,
                private _transcodingProfileManagement: TranscodingProfileManagement,
                private _logger: KalturaLogger,
                private _permissionsService: KMCPermissionsService,
                private _widgetService: EntryFlavoursWidget,
                private _appLocalization: AppLocalization) {

    }

    ngOnInit() {
        this._prepare();
    }

    ngOnDestroy() {

    }

    private _getDisplayName(file: KalturaDropFolderFileGroup): string {
        let displayName: string;
        if (file.files) {
            displayName = `${file.parsedSlug} (${file.files.length}`;
            if (file.status === KalturaDropFolderFileStatus.waiting) {
                displayName += `, ${this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.waiting')}`;
            }
            displayName += ')';
        } else if (file.name) {
            displayName = file.name;
        } else {
            displayName = file.fileName;
        }

        return displayName;
    }

    private _loadDropFolder(searchTerm: string = null): Observable<KalturaDropFolderFileGroup[]> {
        const filter = new KalturaDropFolderFileFilter({
            orderBy: KalturaDropFolderFileOrderBy.createdAtDesc,
            dropFolderIdEqual: this._selectedDropFolder,
            statusIn: [
                KalturaDropFolderFileStatus.noMatch,
                KalturaDropFolderFileStatus.waiting,
                KalturaDropFolderFileStatus.errorHandling,
            ].join(',')
        });

        if (typeof searchTerm === 'string' && searchTerm.trim()) {
            filter.parsedSlugLike = searchTerm.trim();
        }

        const dropFolderFilesListAction = new DropFolderFileListAction({ filter });
        return this._kalturaClient.request(dropFolderFilesListAction)
            .map(response => {
                const result = []; // results array
                const dict = {}; // slugs dictionary
                let group: KalturaDropFolderFile; // dffs group (by slug)
                const parseFailedStr = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.error');

                response.objects.forEach(file => {
                    if (file instanceof KalturaDropFolderFile) {
                        // for files in status waiting, we only want files with a matching slug
                        if (file.status === KalturaDropFolderFileStatus.waiting && file.parsedSlug !== this.entry.referenceId) {
                            return;
                        }

                        // group all files where status == ERROR_HANDLING under same group
                        if (file.status === KalturaDropFolderFileStatus.errorHandling) {
                            file.parsedSlug = parseFailedStr;
                        }

                        // get relevant group
                        if (!dict[file.parsedSlug]) {
                            // create group
                            group = new KalturaDropFolderFile();
                            group.parsedSlug = file.parsedSlug;
                            (<any>group).createdAt = file.createdAt;
                            (<KalturaDropFolderFileGroup>group).files = [];
                            dict[group.parsedSlug] = group;
                        } else {
                            group = dict[file.parsedSlug];
                            // update date if needed
                            if (group.createdAt > file.createdAt) {
                                (<any>group).createdAt = file.createdAt;
                            }
                        }

                        // add dff to files list
                        (<KalturaDropFolderFileGroup>group).files.push(file);

                        // if any file in the group is in waiting status, set the group to waiting:
                        if (file.status === KalturaDropFolderFileStatus.waiting) {
                            (<any>group).status = KalturaDropFolderFileStatus.waiting;
                        }
                    }
                });

                let wait: KalturaDropFolderFile;
                for (const slug in dict) {
                    if (dict.hasOwnProperty(slug) && slug !== parseFailedStr) {
                        if (dict[slug].status === KalturaDropFolderFileStatus.waiting) {
                            // we assume there's only one...
                            wait = dict[slug];
                        } else {
                            (<KalturaDropFolderFileGroup>dict[slug]).displayName = this._getDisplayName(dict[slug]);
                            result.push(dict[slug]);
                        }
                    }
                }
                // put the matched waiting file first
                if (wait) {
                    result.unshift(wait);
                }

                // put the parseFailed last
                if (dict[parseFailedStr]) {
                    (<KalturaDropFolderFileGroup>dict[parseFailedStr]).displayName = this._getDisplayName(dict[parseFailedStr]);
                    (<KalturaDropFolderFileGroup>dict[parseFailedStr]).error = true;
                    result.push(dict[parseFailedStr]);
                }

                return result;
            });
    }

    private _loadDropFoldersList(): Observable<KalturaDropFolderFileGroup[]> {
        const dropFoldersListAction = new DropFolderListAction({
            filter: new KalturaDropFolderFilter({
                orderBy: KalturaDropFolderOrderBy.nameDesc,
                statusEqual: KalturaDropFolderStatus.enabled
            })
        });

        return this._kalturaClient.request(dropFoldersListAction)
            .cancelOnDestroy(this)
            .map(response => {
                if (response.objects.length) {
                    const dropFoldersList = [];
                    response.objects.forEach(dropFolder => {
                        if (dropFolder instanceof KalturaDropFolder) {
                            if (dropFolder.fileHandlerType === KalturaDropFolderFileHandlerType.content) {
                                const cfg: KalturaDropFolderContentFileHandlerConfig = dropFolder.fileHandlerConfig as KalturaDropFolderContentFileHandlerConfig;
                                if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.addAsNew) {
                                    dropFoldersList.push(dropFolder);
                                } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
                                    dropFoldersList.push(dropFolder);
                                } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
                                    dropFoldersList.push(dropFolder);
                                }
                            }
                        } else {
                            throw new Error(`invalid type provided, expected KalturaDropFolder, got ${typeof dropFolder}`);
                        }
                    });

                    return dropFoldersList;
                } else {
                    return [];
                }
            })
            .do(dropFoldersList => {
                this._dropFoldersList = dropFoldersList;
                this._dropFoldersListOptions = dropFoldersList.map(folder => ({ label: folder.name, value: folder.id }));
                this._selectedDropFolder = dropFoldersList.length ? dropFoldersList[0].id : null;
            })
            .switchMap(() => {
                if (this._selectedDropFolder === null) {
                    return Observable.of([]);
                }

                return this._loadDropFolder();
            });
    }

    private _loadConversionProfiles(): Observable<KalturaConversionProfileAssetParams[]> {
        const filter = new KalturaConversionProfileFilter({
            orderBy: KalturaConversionProfileOrderBy.createdAtDesc,
            typeEqual: KalturaConversionProfileType.media
        });
        const conversionProfileAssetParamsListAction = new ConversionProfileAssetParamsListAction({
            filter: new KalturaConversionProfileAssetParamsFilter({ conversionProfileIdFilter: filter }),
            pager: new KalturaFilterPager({ pageSize: 1000 })
        }).setRequestOptions(
            new KalturaRequestOptions({
                responseProfile: new KalturaDetachedResponseProfile({
                    type: KalturaResponseProfileType.includeFields,
                    fields: 'conversionProfileId,systemName,assetParamsId'
                })
            })
        );

        return this._kalturaClient
            .request(conversionProfileAssetParamsListAction)
            .map(res => res.objects);
    }

    private _loadConversionProfilesWithAssets(): Observable<{ id: number, assets: KalturaConversionProfileAssetParams[] }[]> {
        return this._transcodingProfileManagement.get()
            .switchMap(
                () => this._loadConversionProfiles(),
                (transcodingProfiles, assets) => {
                    return transcodingProfiles.map(profile => {
                        return {
                            id: profile.id,
                            assets: assets.filter(item => item.conversionProfileId === profile.id)
                        };
                    });
                }
            );
    }

    private _getAssetParamsId(conversionProfileId: number, flavorName: string): number {
        const relevantProfile = this._conversionProfilesList.find(({ id }) => id === conversionProfileId);
        if (relevantProfile) {
            const relevantAssetParam = relevantProfile.assets.find(({ systemName }) => systemName === flavorName);
            if (relevantAssetParam) {
                return relevantAssetParam.assetParamsId;
            }
        }
        return -1;
    }

    private _updateContent(): void {
        this._logger.info(`handle update content request`);
        const selectedFolder = this._dropFoldersList.find(({ id }) => id === this._selectedDropFolder);
        const mediaResource = new KalturaAssetsParamsResourceContainers({
            resources: this._selectedFile.files.map(file => {
                console.warn(file);
                return new KalturaAssetParamsResourceContainer({
                    resource: new KalturaDropFolderFileResource({ dropFolderFileId: file.id }),
                    assetParamsId: this._getAssetParamsId(selectedFolder.conversionProfileId, file.parsedFlavor)
                });
            })
        });

        this._kalturaClient
            .request(new MediaUpdateContentAction({
                entryId: this.entry.id,
                resource: mediaResource,
                conversionProfileId: selectedFolder.conversionProfileId
            }))
            .cancelOnDestroy(this)
            .tag('block-shell')
            .subscribe(
                () => {
                    this._logger.info(`handle successful update content request, close popup`);
                    this.parentPopupWidget.close();
                    this._widgetService.refresh();
                },
                error => {
                    this._logger.warn(`handle failed update content request, show alert`, { errorMessage: error.message });
                    this._blockerMessage = new AreaBlockerMessage({
                        title: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert`);
                                this._blockerMessage = null;
                                this.parentPopupWidget.close();
                            }
                        }]
                    });
                });
    }

    private _prepare(): void {
        this._logger.info(`handle prepare action, load dropfolders list and conversion profiles with assets request`);
        this._isLoading = true;
        this._loadDropFoldersList()
            .switchMap(
                (dropFolderFiles) => dropFolderFiles.length ? this._loadConversionProfilesWithAssets() : Observable.of([]),
                (dropFolderFiles, conversionProfilesWithAsset) => ({ dropFolderFiles, conversionProfilesWithAsset })
            )
            .subscribe(
                ({ dropFolderFiles, conversionProfilesWithAsset }) => {
                    this._logger.info(`handle successful data loading`);
                    this._isLoading = false;
                    this._dropFolderFiles = dropFolderFiles;
                    this._conversionProfilesList = conversionProfilesWithAsset;

                    if (!this._dropFoldersList.length) {
                        this._blockerMessage = new AreaBlockerMessage({
                            title: this._appLocalization.get('app.common.attention'),
                            message: this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.noDropFoldersWarning'),
                            buttons: [{
                                label: this._appLocalization.get('app.common.ok'),
                                action: () => {
                                    this._blockerMessage = null;
                                }
                            }]
                        });
                    }
                },
                error => {
                    this._isLoading = false;
                    this._logger.warn(`handle failed data loading, show confirmation`);
                    this._blockerMessage = new AreaBlockerMessage({
                        title: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._logger.info(`user confirmed, retry action`);
                                    this._blockerMessage = null;
                                    this._prepare();
                                }
                            },
                            {
                                label: this._appLocalization.get('app.common.ok'),
                                action: () => {
                                    this._logger.info(`user didn't confirm, abort action, close popup`);
                                    this._blockerMessage = null;
                                    this.parentPopupWidget.close();
                                }
                            }
                        ]
                    });
                });
    }

    public _loadFolderData(searchTerm: string = null): void {
        this._isLoading = true;
        this._loadDropFolder(searchTerm)
            .cancelOnDestroy(this)
            .subscribe(
                files => {
                    this._isLoading = false;
                    this._dropFolderFiles = files;
                    this._selectedFile = null;
                }, error => {
                    this._isLoading = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        title: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._blockerMessage = null;
                            }
                        }]
                    });
                });
    }

    public _setReferenceId(): void {
        this._logger.info(`handle set reference id action by user`, { referenceId: this._selectedFile ? this._selectedFile.parsedSlug : null });
        if (!this._selectedFile) {
            this._logger.info(`file was not selected, abort action`);
            return;
        }

        const updateEntryAction = new BaseEntryUpdateAction({
            entryId: this.entry.id,
            baseEntry: new KalturaBaseEntry({ referenceId: this._selectedFile.parsedSlug })
        });

        this._kalturaClient.request(updateEntryAction)
            .tag('block-shell')
            .cancelOnDestroy(this)
            .subscribe(
                () => {
                    this._logger.info(`handle successful set reference id action, show alert`);
                    this._blockerMessage = new AreaBlockerMessage({
                        title: this._appLocalization.get('app.common.attention'),
                        message: this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.setReferenceIdWarning'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert, close popup`);
                                this._blockerMessage = null;
                                this.parentPopupWidget.close();
                            }
                        }]
                    });
                },
                error => {
                    this._logger.warn(`handle failed set reference id action, show alert`);
                    this._blockerMessage = new AreaBlockerMessage({
                        title: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.cancel'),
                            action: () => {
                                this._logger.info(`user dismissed alert, close popup`);
                                this._blockerMessage = null;
                                this.parentPopupWidget.close();
                            }
                        }]
                    });
                });
    }

    public _addFiles(): void {
        this._logger.info(`handle add file/s action by user, show confirmation`, { selectedFilesGroup: this._selectedFile ? this._selectedFile.id : null });
        if (!this._selectedFile) {
            this._logger.info(`file was not selected abort action`);
            return;
        }

        this._blockerMessage = new AreaBlockerMessage({
            title: this._appLocalization.get('app.common.attention'),
            message: this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addFilesWarning'),
            buttons: [
                {
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                        this._logger.info(`user confirmed, proceed action`);
                        this._blockerMessage = null;
                        this._updateContent();
                    }
                },
                {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                        this._logger.info(`user didn't confirm, abort action`);
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    }

    public _searchFolder(searchTerm: string): void {
        this._logger.info(`handle search drop folder action by user`, { searchTerm });
        this._loadFolderData(searchTerm);
    }

    public _clearFolderSearch(): void {
        this._logger.info(`handle clear search drop folder action by user`);
        this._loadFolderData();
    }
}
