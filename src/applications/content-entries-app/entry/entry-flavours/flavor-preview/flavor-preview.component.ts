import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { FlavorAssetGetUrlAction } from 'vidiun-ngx-client';
import { Flavor } from '../flavor';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
	selector: 'vFlavorPreview',
	templateUrl: './flavor-preview.component.html',
	styleUrls: ['./flavor-preview.component.scss']
})
export class FlavorPreview implements AfterViewInit, OnDestroy {

	@Input() currentFlavor: Flavor;
	@Input() currentEntry: VidiunMediaEntry;
	@Input() parentPopupWidget: PopupWidgetComponent;

	private _parentPopupStateChangeSubscribe: ISubscription;
	public _previewSource = "";
	public _loadingError = "";

	constructor(private _vidiunServerClient: VidiunClient) {

	}

	ngAfterViewInit() {
		this._previewSource = "";
		this._loadingError = "";
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._vidiunServerClient.request(new FlavorAssetGetUrlAction({
							id: this.currentFlavor.id
						}))
							.pipe(cancelOnDestroy(this))
							.subscribe(
								url => {
									this._previewSource = url;},
								error => {
									this._loadingError = error.message;
								}
							);
					}
					if (event.state === PopupWidgetStates.Close) {
						this._previewSource = "";
					}
				});
		}
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

}

