import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { VidiunUtils } from '@vidiun-ng/vidiun-common';
import { BrowserService } from 'app-shared/vmc-shell';
import { PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';

import { EntryThumbnailsWidget, ThumbnailRow } from './entry-thumbnails-widget.service';
import { Menu, MenuItem } from 'primeng/primeng';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';


@Component({
    selector: 'vEntryThumbnails',
    templateUrl: './entry-thumbnails.component.html',
    styleUrls: ['./entry-thumbnails.component.scss']
})
export class EntryThumbnails implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;
	@ViewChild('capturePopup') public capturePopup: PopupWidgetComponent;
	@ViewChild('actionsmenu') private actionsMenu: Menu;
	public _actions: MenuItem[] = [];
	public _vmcPermissions = VMCPermissions;
  public _documentWidth: number;

	private currentThumb: ThumbnailRow;
	private _popupStateChangeSubscribe: ISubscription;

  @HostListener('window:resize', [])
  onWindowResize() {
    this._documentWidth = document.body.clientWidth;
  }

	constructor(public _widgetService: EntryThumbnailsWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
      this._documentWidth = document.body.clientWidth;
      this._widgetService.attachForm();

	    this._actions = [
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.download'), command: (event) => {this.actionSelected("download");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.preview'), command: (event) => {this.actionSelected("preview");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.delete'), styleClass: 'vDanger', command: (event) => {this.actionSelected("delete");}}
	    ];
    }

	openActionsMenu(event: any, thumb: ThumbnailRow): void{
		if (this.actionsMenu){
			this.currentThumb = thumb; // save the selected caption for usage in the actions menu
			this._actions[2].disabled = this.currentThumb.isDefault; // disable delete for default thumbnail
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "delete":
				this._browserService.confirm(
					{
						header: this._appLocalization.get('applications.content.entryDetails.thumbnails.deleteConfirmHeader'),
						message: this._appLocalization.get('applications.content.entryDetails.thumbnails.deleteConfirm'),
						accept: () => {
							this._widgetService.deleteThumbnail(this.currentThumb.id);
						}
					}
				);
				break;
			case "download":
				this._downloadFile();
				break;
			case "preview":
				this._browserService.openLink(this.currentThumb.url);
				break;
		}
	}

	private _downloadFile(): void {

		var x = new XMLHttpRequest();
		x.open("GET", this.currentThumb.url, true);
		x.responseType = 'blob';
		x.onload = (e) => {
			return VidiunUtils.download(x.response, this.currentThumb.id + "." + this.currentThumb.fileExt, "image/"+this.currentThumb.fileExt );
		}
		x.send();
	}

    ngOnDestroy() {
	    this.actionsMenu.hide();
	    this._popupStateChangeSubscribe.unsubscribe();
		this._widgetService.detachForm();
	}

    ngAfterViewInit() {
	    if (this.capturePopup) {
		    this._popupStateChangeSubscribe = this.capturePopup.state$
			    .subscribe(event => {
				    if (event.state === PopupWidgetStates.Close) {
					    if (event.context && event.context.currentPosition !== null){
						    this._widgetService.captureThumbnail(event.context.currentPosition);
					    }
				    }
			    });
	    }
    }

}
