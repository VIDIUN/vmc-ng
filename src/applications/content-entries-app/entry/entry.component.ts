import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VidiunEntryStatus, VidiunExternalMediaEntry, VidiunMediaEntry, VidiunMediaType, VidiunSourceType } from 'vidiun-ngx-client';
import { ActionTypes, EntryStore, NotificationTypes } from './entry-store.service';
import { EntrySectionsListWidget } from './entry-sections-list/entry-sections-list-widget.service';
import { EntryMetadataWidget } from './entry-metadata/entry-metadata-widget.service';
import { EntryPreviewWidget } from './entry-preview/entry-preview-widget.service';
import { EntryDetailsWidget } from './entry-details/entry-details-widget.service';
import { EntryCaptionsWidget } from './entry-captions/entry-captions-widget.service';
import { EntryAccessControlWidget } from './entry-access-control/entry-access-control-widget.service';
import { EntryClipsWidget } from './entry-clips/entry-clips-widget.service';
import { EntryRelatedWidget } from './entry-related/entry-related-widget.service';
import { EntryLiveWidget } from './entry-live/entry-live-widget.service';
import { EntryFlavoursWidget } from './entry-flavours/entry-flavours-widget.service';
import { EntryThumbnailsWidget } from './entry-thumbnails/entry-thumbnails-widget.service';
import { EntrySchedulingWidget } from './entry-scheduling/entry-scheduling-widget.service';
import { EntryUsersWidget } from './entry-users/entry-users-widget.service';
import { EntryWidgetsManager } from './entry-widgets-manager';
import { AreaBlockerMessage, AreaBlockerMessageButton, PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Observable } from 'rxjs';
import { EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntryDistributionWidget } from './entry-distribution/entry-distribution-widget.service';
import { EntryAdvertisementsWidget } from './entry-advertisements/entry-advertisements-widget.service';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { ClipAndTrimAppViewService, LiveDashboardAppViewService } from 'app-shared/vmc-shared/vmc-views/component-views';
import { CustomMenuItem } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { PreviewAndEmbedEvent } from 'app-shared/vmc-shared/events';
import { AppEventsService } from 'app-shared/vmc-shared';
import { ContentEntriesAppService } from '../content-entries-app.service';
import { BrowserService } from 'app-shared/vmc-shell';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { AnalyticsNewMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
	selector: 'vEntry',
	templateUrl: './entry.component.html',
	styleUrls: ['./entry.component.scss'],
	providers : [
		EntryStore,
		EntryWidgetsManager,
		EntrySectionsListWidget,
		EntryUsersWidget,
		EntryThumbnailsWidget,
		EntrySchedulingWidget,
		EntryRelatedWidget,
		EntryFlavoursWidget,
		EntryLiveWidget,
		EntryClipsWidget,
		EntryCaptionsWidget,
		EntryAccessControlWidget,
		EntryMetadataWidget,
		EntryDetailsWidget,
		EntryPreviewWidget,
		EntryDistributionWidget,
		EntryAdvertisementsWidget,
        VidiunLogger.createLogger('EntryComponent')
	]
})
export class EntryComponent implements OnInit, OnDestroy {
    @ViewChild('liveDashboard') _liveDashboard: PopupWidgetComponent;
    @ViewChild('clipAndTrim') _clipAndTrim: PopupWidgetComponent;
    @ViewChild('bulkActionsPopup') _bulkActionsPopup: PopupWidgetComponent;
	public _entryName: string;
	public _entryType: VidiunMediaType;

	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public _currentEntryId: string;
	public _enablePrevButton: boolean;
	public _enableNextButton: boolean;
	public _entryHasChanges : boolean;
	public _vmcPermissions = VMCPermissions;
    public _items: CustomMenuItem[] = [
        {
            label: this._appLocalization.get('applications.content.table.liveDashboard'),
            commandName: 'liveDashboard',
            styleClass: '',
            disabled: !this._liveDashboardAppViewService.isAvailable()
        },
        {
            label: this._appLocalization.get('applications.content.table.download'),
            commandName: 'download',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
            commandName: 'preview',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.editor'),
            commandName: 'editor',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.delete'),
            commandName: 'delete',
            styleClass: 'vDanger'
        }
    ];
    public _menuItems: CustomMenuItem[] = [];

	public get _isSaveDisabled(): boolean {
    const editAccessControlAllowed = this._permissionsService.hasAnyPermissions([
      VMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
      VMCPermissions.CONTENT_MANAGE_RECONVERT,
      VMCPermissions.CONTENT_MANAGE_ENTRY_USERS,
      VMCPermissions.CONTENT_MANAGE_METADATA,
      VMCPermissions.CONTENT_MANAGE_SCHEDULE,
      VMCPermissions.CONTENT_MANAGE_THUMBNAIL,
      VMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
      VMCPermissions.CONTENT_MODERATE_METADATA,
      VMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
      VMCPermissions.LIVE_STREAM_UPDATE,
    ]);

		return !this._entryStore.entryIsDirty || !editAccessControlAllowed;
	}

    public _analyticsAllowed: boolean;

	constructor(entryWidgetsManager: EntryWidgetsManager,
	            widget1: EntrySectionsListWidget,
	            widget2: EntryUsersWidget,
	            widget3: EntryThumbnailsWidget,
	            widget4: EntrySchedulingWidget,
	            widget5: EntryRelatedWidget,
	            widget6: EntryFlavoursWidget,
	            widget7: EntryLiveWidget,
	            widget8: EntryClipsWidget,
	            widget9: EntryCaptionsWidget,
	            widget10: EntryAccessControlWidget,
	            widget11: EntryMetadataWidget,
	            widget12: EntryDetailsWidget,
	            widget13: EntryPreviewWidget,
	            widget14: EntryDistributionWidget,
	            widget15: EntryAdvertisementsWidget,
	            private _permissionsService: VMCPermissionsService,
	            private _entriesStore: EntriesStore,
	            private _appLocalization: AppLocalization,
	            public _entryStore: EntryStore,
                private _contentEntryViewService: ContentEntryViewService,
                private _liveDashboardAppViewService: LiveDashboardAppViewService,
                private _contentEntriesAppService: ContentEntriesAppService,
                private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
                private _browserService: BrowserService,
                private _appEvents: AppEventsService,
                private _entryRoute: ActivatedRoute,
                private _logger: VidiunLogger,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _router: Router) {
		entryWidgetsManager.registerWidgets([
			widget1, widget2, widget3, widget4, widget5, widget6, widget7,
			widget8, widget9, widget10, widget11, widget12, widget13, widget14,
			widget15
		]);

        this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable();
	}

	ngOnDestroy() {
	}

    private _hideMenuItems(entry: VidiunMediaEntry,
                           { commandName }: { commandName: string }): boolean {
        const { sourceType, status, mediaType } = entry;
        const isReadyStatus = status === VidiunEntryStatus.ready;
        const isPreviewCommand = commandName === 'preview';
        const isVidiunLiveStream = sourceType === VidiunSourceType.liveStream;
        const isLiveDashboardCommand = commandName === 'liveDashboard';
        const cannotDeleteEntry = commandName === 'delete' && !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DELETE);
        const isDownloadCommand = commandName === 'download';
        const isExternalMedia = entry instanceof VidiunExternalMediaEntry;
        const isNotVideoAudioImage = [VidiunMediaType.video, VidiunMediaType.audio, VidiunMediaType.image].indexOf(mediaType) === -1;
        return !(
            (!isReadyStatus && isPreviewCommand) || // hide if trying to share & embed entry that isn't ready
            (isLiveDashboardCommand && !isVidiunLiveStream) || // hide live-dashboard menu item for entry that isn't vidiun live
            (isDownloadCommand && (isNotVideoAudioImage || isExternalMedia)) ||
            cannotDeleteEntry
        );
    }

    private _buildMenu(entry: VidiunMediaEntry): void {
        this._menuItems = this._items
            .filter(item => this._hideMenuItems(entry, item))
            .map(item => {
                switch (item.commandName) {
                    case 'preview':
                        item.disabled = entry.status === VidiunEntryStatus.noContent;
                        item.command = () => this._appEvents.publish(new PreviewAndEmbedEvent(entry));
                        break;
                    case 'liveDashboard':
                        item.command = () => this._liveDashboard.open();
                        break;
                    case 'editor':
                        item.disabled = !this._clipAndTrimAppViewService.isAvailable({
                            entry: entry,
                            hasSource: this._entryStore.hasSource.value()
                        });
                        item.command = () => this._clipAndTrim.open();
                        break;
                    case 'delete':
                        item.command = () => this._browserService.confirm({
                            header: this._appLocalization.get('applications.content.entries.deleteEntry'),
                            message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', [entry.id]),
                            accept: () => this._deleteEntry(entry.id)
                        });
                        break;
                    case 'download':
                        item.command = () => this._downloadEntry(entry);
                        item.disabled = entry.status !== VidiunEntryStatus.ready || !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DOWNLOAD);
                        break;
                    default:
                        break;
                }
                return item;
            });
    }

    private _downloadEntry(entry: VidiunMediaEntry): void {
	    if (entry.mediaType === VidiunMediaType.video) {
            this._bulkActionsPopup.open();
        } else {
            this._browserService.openLink(entry.downloadUrl);
        }
    }

    private _deleteEntry(entryId: string): void {
        this._logger.info(`handle delete entry action by user`, { entryId });
        if (!entryId) {
            this._logger.info('EntryId is not defined. Abort action');
            return;
        }

        this._contentEntriesAppService.deleteEntry(entryId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                () => {
                    this._backToList();
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._entryStore.reloadEntry();
                        }
                    });
                }
            );
    }

	private _updateNavigationState() {
		const entries = this._entriesStore.entries.data();
		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			this._enableNextButton = currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1);
			this._enablePrevButton = currentEntryIndex > 0;

		} else {
			this._enableNextButton = false;
			this._enablePrevButton = false;
		}
	}

	ngOnInit() {

	    this._entryStore.notifications$
            .pipe(cancelOnDestroy(this))
            .subscribe(
                ({ type, error }) => {
                    switch(type) {
                        case NotificationTypes.ViewEntered:
                            const { entry } = this._entryStore;

                            if (entry) {
                                this._contentEntryViewService.viewEntered({
                                    entry,
                                    activatedRoute: this._entryRoute,
                                    section: ContentEntryViewSections.ResolveFromActivatedRoute
                                });
                            }
                            break;
                        default:
                            break;
                    }
                });

		this._entryStore.state$
			.pipe(cancelOnDestroy(this))
			.subscribe(
				status => {

					this._showLoader = false;
					this._areaBlockerMessage = null;

					if (status) {
						switch (status.action) {
							case ActionTypes.EntryLoading:
								this._showLoader = true;

								// when loading new entry in progress, the 'entryID' property
								// reflect the entry that is currently being loaded
								// while 'entry$' stream is null
								this._currentEntryId = this._entryStore.entryId;
								this._updateNavigationState();
								this._entryHasChanges = false;
								break;
							case ActionTypes.EntryLoaded:
							    const { entry } = this._entryStore;
								this._entryName = entry.name;
								this._entryType = entry.mediaType;

                                this._buildMenu(entry);
								break;
							case ActionTypes.EntryLoadingFailed:
								let message = status.error ? status.error.message : '';
								message = message || this._appLocalization.get('applications.content.errors.loadError');
								this._areaBlockerMessage = new AreaBlockerMessage({
									message: message,
									buttons: [
										this._createBackToEntriesButton(),
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
											action: () => {
												this._entryStore.reloadEntry();
											}
										}
									]
								});
								break;
							case ActionTypes.EntrySaving:
								break;
							case ActionTypes.EntrySavingFailed:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.saveError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.reload'),
											action: () => {
												this._entryStore.reloadEntry();
											}
										}
									]
								});
								break;
							case ActionTypes.EntryDataIsInvalid:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.validationError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							case ActionTypes.ActiveSectionBusy:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.busyError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							case ActionTypes.EntryPrepareSavingFailed:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.savePrepareError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							default:
								break;
						}
					}
				},
				error => {
					// TODO [vmc] navigate to error page
					throw error;
				});
	}

	private _createBackToEntriesButton(): AreaBlockerMessageButton {
		return {
			label: 'Back To Entries',
			action: () => {
				this._entryStore.returnToEntries();
			}
		};
	}

	public _backToList() {
		this._entryStore.returnToEntries();
	}

	public _save() {
		this._entryStore.saveEntry();
	}

	public _navigateToPrevious(): void {
		const entries = this._entriesStore.entries.data();

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex > 0) {
				const prevEntry = entries[currentEntryIndex - 1];
				this._entryStore.openEntry(prevEntry.id);
			}
		}
	}

	public _navigateToNext(): void {
		const entries = this._entriesStore.entries.data();

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1)) {
				const nextEntry = entries[currentEntryIndex + 1];
				this._entryStore.openEntry(nextEntry.id);
			}
		}
	}

	public canLeave(): Observable<{ allowed: boolean }> {
		return this._entryStore.canLeave();
	}

    public _openEntryAnalytics(): void {
        if (this._analyticsAllowed) {
            this._router.navigate(['analytics/entry'], { queryParams: { id: this._currentEntryId }});
        }
    }
}

