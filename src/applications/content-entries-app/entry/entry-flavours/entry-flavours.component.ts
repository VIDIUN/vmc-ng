import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UploadManagement } from '@vidiun-ng/vidiun-common';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { FileDialogComponent } from '@vidiun-ng/vidiun-ui';
import { VidiunFlavorAssetStatus } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';
import { Menu, MenuItem } from 'primeng/primeng';
import { EntryFlavoursWidget, ReplacementData } from './entry-flavours-widget.service';
import { Flavor } from './flavor';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { BrowserService } from 'app-shared/vmc-shell';
import { NewEntryFlavourFile } from 'app-shared/vmc-shell/new-entry-flavour-file';
import { globalConfig } from 'config/global';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { VidiunEntryStatus } from 'vidiun-ngx-client';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';

@Component({
    selector: 'vEntryFlavours',
    templateUrl: './entry-flavours.component.html',
    styleUrls: ['./entry-flavours.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'flavors-table' }
    ]
})
export class EntryFlavours implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('drmPopup') drmPopup: PopupWidgetComponent;
	@ViewChild('previewPopup') previewPopup: PopupWidgetComponent;
	@ViewChild('importPopup') importPopup: PopupWidgetComponent;
	@ViewChild('matchDropFolder') matchDropFolder: PopupWidgetComponent;
    @ViewChild('linkPopup') linkPopup: FileDialogComponent;
    @ViewChild('actionsmenu') private actionsMenu: Menu;
    @ViewChild('fileDialog') private fileDialog: FileDialogComponent;
	public _actions: MenuItem[] = [];
	public _vmcPermissions = VMCPermissions;

	public _selectedFlavor: Flavor;
	public _uploadFilter: string = "";
    public _loadingError = null;

	public _documentWidth: number = 2000;
	public _showActionsView = false;
    public _replaceButtonsLabel = '';

	constructor(public _columnsResizeManager: ColumnsResizeManagerService,
                public _widgetService: EntryFlavoursWidget,
                private _el: ElementRef<HTMLElement>,
              private _uploadManagement: UploadManagement,
              private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _browserService: BrowserService) {
    }

    ngOnInit() {
	    this._documentWidth = document.body.clientWidth;
        this._widgetService.attachForm();

        this._widgetService.replacementData$
            .pipe(cancelOnDestroy(this))
            .subscribe(replacementData => this._updateShowActionsView(replacementData));

        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .filter(Boolean)
            .subscribe(entry => {
                if (entry.status === VidiunEntryStatus.noContent) {
                    this._replaceButtonsLabel = entry.mediaType === VidiunMediaType.audio
                        ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addAudio')
                        : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addVideo');
                } else {
                    this._replaceButtonsLabel = entry.mediaType === VidiunMediaType.audio
                        ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceAudio')
                        : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceVideo');
                }
            })
    }

    public _updateShowActionsView(replacementData: ReplacementData): void {
        const processingFlavorsStatuses = [
            VidiunFlavorAssetStatus.converting.toString(),
            VidiunFlavorAssetStatus.waitForConvert.toString(),
            VidiunFlavorAssetStatus.importing.toString(),
            VidiunFlavorAssetStatus.validating.toString(),
            VidiunFlavorAssetStatus.queued.toString()
        ];
        const flavors = this._widgetService.selectedFlavors || [];
        const processingFlavors = flavors.some(flavor => processingFlavorsStatuses.indexOf(flavor.status) !== -1);

        if (!replacementData || !this._widgetService.data || processingFlavors) {
            this._showActionsView = false;
            return;
        }

        const entry = this._widgetService.data;
        const noCurrentlyReplacing = !replacementData.tempEntryId;
        const hasReplacePermission = this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_INTO_READY);
        let showActionsView = true;
        switch (entry.status) {
            case VidiunEntryStatus.noContent:
                showActionsView = this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_INTO_ORPHAN);
                break;
            case VidiunEntryStatus.ready:
            case VidiunEntryStatus.errorConverting:
            case VidiunEntryStatus.errorImporting:
                showActionsView = noCurrentlyReplacing && hasReplacePermission;
                break;
            default:
                showActionsView = noCurrentlyReplacing && hasReplacePermission;
                break;
        }

        this._showActionsView = showActionsView;
    }

	openActionsMenu(event: any, flavor: Flavor): void{
		if (this.actionsMenu){
			this._actions = [];
			this._uploadFilter = this._setUploadFilter(this._widgetService.data);
			if (this._widgetService.sourceAvailable && (flavor.id === '' || (flavor.id !== '' && flavor.status === VidiunFlavorAssetStatus.deleted.toString()))){
				this._actions.push({id: 'convert', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.convert'), command: (event) => {this.actionSelected("convert");}});
			}
			if ((flavor.isSource && this.isSourceReady(flavor)) || ( !flavor.isSource && flavor.id !== '' &&
					(flavor.status === VidiunFlavorAssetStatus.exporting.toString() || flavor.status === VidiunFlavorAssetStatus.ready.toString() ))){
				this._actions.push({id: 'download', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.download'), command: (event) => {this.actionSelected("download");}});
			}
			if ((flavor.isSource && (this.isSourceReady(flavor) || flavor.status === VidiunFlavorAssetStatus.deleted.toString()))||
					flavor.id === "" || (flavor.id !== "" && (flavor.status === VidiunFlavorAssetStatus.deleted.toString() ||
					flavor.status === VidiunFlavorAssetStatus.error.toString() || flavor.status === VidiunFlavorAssetStatus.notApplicable.toString() ||
					flavor.status === VidiunFlavorAssetStatus.exporting.toString() || flavor.status === VidiunFlavorAssetStatus.ready.toString()))
			){
				this._actions.push({id: 'upload', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.upload'), command: (event) => {this.actionSelected("upload");}});
				this._actions.push({id: 'import', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.import'), command: (event) => {this.actionSelected("import");}});
                this._actions.push({
                    id: 'link',
                    label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.link'),
                    command: () => this.actionSelected('link')
                });
                this._actions.push({
                    id: 'match',
                    label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.match'),
                    command: () => this.actionSelected('match')
                });
			}
			if ((flavor.isSource && this.isSourceReady(flavor) && flavor.isWeb) ||
					(flavor.id !== "" && flavor.isWeb && (flavor.status === VidiunFlavorAssetStatus.exporting.toString() || flavor.status === VidiunFlavorAssetStatus.ready.toString()))){
				this._actions.push({id: 'preview', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.preview'), command: (event) => {this.actionSelected("preview");}});
			}
			if (this._widgetService.sourceAvailable && !flavor.isSource && (flavor.status === VidiunFlavorAssetStatus.error.toString() || flavor.status === VidiunFlavorAssetStatus.exporting.toString() ||
				flavor.status === VidiunFlavorAssetStatus.ready.toString() || flavor.status === VidiunFlavorAssetStatus.notApplicable.toString())){
				this._actions.push({id: 'reconvert', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.reconvert'), command: (event) => {this.actionSelected("reconvert");}});
			}
			if (flavor.isWidevine && flavor.status === VidiunFlavorAssetStatus.ready.toString()){
				this._actions.push({id: 'drm', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.drm'), command: (event) => {this.actionSelected("drm");}});
			}

            if ((flavor.isSource && this.isSourceReady(flavor)) || ( !flavor.isSource && flavor.id !== '' &&
                    (flavor.status === VidiunFlavorAssetStatus.exporting.toString() || flavor.status === VidiunFlavorAssetStatus.ready.toString() ))){
                this._actions.push({id: 'delete', styleClass: 'vDanger', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.delete'), command: (event) => {this.actionSelected("delete");}});
            }

            this._permissionsService.filterList(<{ id: string }[]>this._actions, {
                'import': VMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
                'upload': VMCPermissions.CONTENT_INGEST_UPLOAD,
                'link': VMCPermissions.CONTENT_INGEST_REMOTE_STORAGE,
                'match': VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH
            });

			if (this._actions.length) {
				this._selectedFlavor = flavor;
				this.actionsMenu.toggle(event);
			}
		}
	}

	private isSourceReady(flavor: Flavor): boolean{
		return (flavor.isSource && flavor.status !== VidiunFlavorAssetStatus.converting.toString() && flavor.status !== VidiunFlavorAssetStatus.waitForConvert.toString() &&
			flavor.status !== VidiunFlavorAssetStatus.queued.toString() && flavor.status !== VidiunFlavorAssetStatus.importing.toString() &&
			flavor.status !== VidiunFlavorAssetStatus.validating.toString());
	}

	private actionSelected(action: string): void{
		switch (action){
			case "delete":
				this._widgetService.deleteFlavor(this._selectedFlavor);
				break;
			case "download":
				this._widgetService.downloadFlavor(this._selectedFlavor);
				break;
			case "upload":
				this.fileDialog.open();
				break;
			case "import":
				this.importPopup.open();
				break;
			case "convert":
				this._widgetService.convertFlavor(this._selectedFlavor);
				break;
			case "reconvert":
				this._widgetService.reconvertFlavor(this._selectedFlavor);
				break;
			case "preview":
				this.previewPopup.open();
				break;
			case "drm":
				this.drmPopup.open();
				break;
            case 'link':
                this._linkFlavor();
                break;
            case 'match':
                this.matchDropFolder.open();
                break;
            default:
                break;
		}
	}

    private _linkFlavor(): void {
        if (this._widgetService.storageProfile) {
            this.linkPopup.open();
        } else {
            this._browserService.alert({
                header: this._appLocalization.get('app.common.error'),
                message: this._appLocalization.get('applications.content.entryDetails.flavours.link.noStorageProfile')
            });
        }
    }

	private _setUploadFilter(entry: VidiunMediaEntry): string{
		let filter = "";
		if (entry.mediaType.toString() === VidiunMediaType.video.toString()){
			filter = ".flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv";
		}
		if (entry.mediaType.toString() === VidiunMediaType.audio.toString()){
			filter = ".flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav";
		}
		return filter;
	}

  private _validateFileSize(file: File): boolean {
    const maxFileSize = globalConfig.vidiunServer.maxUploadFileSize;
    const fileSize = file.size / 1024 / 1024; // convert to Mb

    return this._uploadManagement.supportChunkUpload(new NewEntryFlavourFile(null)) || fileSize < maxFileSize;
  }

  public _onFileSelected(selectedFiles: FileList) {
    if (selectedFiles && selectedFiles.length) {
      const fileData: File = selectedFiles[0];

      if (this._validateFileSize(fileData)) {
        this._widgetService.uploadFlavor(this._selectedFlavor, fileData);
      } else {
        this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
          message: this._appLocalization.get('applications.upload.validation.fileSizeExceeded')
        });
      }
    }
  }

    ngOnDestroy() {
	    this.actionsMenu.hide();
		this._widgetService.detachForm();

	}


    ngAfterViewInit() {
	    if (this.importPopup) {
		    this.importPopup.state$
                .pipe(cancelOnDestroy(this))
			    .subscribe(event => {
				    if (event.state === PopupWidgetStates.Close) {
					    if (event.context && event.context.flavorUrl){
						    this._widgetService.importFlavor(this._selectedFlavor, event.context.flavorUrl);
					    }
				    }
			    });
	    }

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }
}

