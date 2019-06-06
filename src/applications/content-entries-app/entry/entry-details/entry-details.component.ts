import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunEntryStatus } from 'vidiun-ngx-client';
import { VidiunSourceType } from 'vidiun-ngx-client';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { BrowserService } from 'app-shared/vmc-shell';
import { EntryDetailsWidget } from './entry-details-widget.service';

export interface EntryDetailsVidiunMediaEntry extends VidiunMediaEntry {
  recordedEntryId?: string
}

@Component({
	selector: 'vEntryDetails',
	templateUrl: './entry-details.component.html',
	styleUrls: ['./entry-details.component.scss']
})
export class EntryDetails implements OnInit, OnDestroy {

	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;
	public _isLive: boolean = false;
	public _isRecordedLive: boolean = false;
	public _hasDuration: boolean = false;
	public _isClip: boolean = false;

	public _currentEntry: EntryDetailsVidiunMediaEntry;

	get currentEntry(): EntryDetailsVidiunMediaEntry {
		return this._currentEntry;
	}



	constructor(public _widgetService: EntryDetailsWidget,
				private browserService: BrowserService,

				public _entryStore: EntryStore) {
	}

	ngOnInit() {
        this._widgetService.attachForm();

		this._widgetService.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryHasContent = this._currentEntry.status.toString() !== VidiunEntryStatus.noContent.toString();
					this._entryReady = this._currentEntry.status.toString() === VidiunEntryStatus.ready.toString();
					const sourceType = this._currentEntry.sourceType.toString();
					this._isLive = (sourceType === VidiunSourceType.liveStream.toString() ||
					sourceType === VidiunSourceType.akamaiLive.toString() ||
					sourceType === VidiunSourceType.akamaiUniversalLive.toString() ||
					sourceType === VidiunSourceType.manualLiveStream.toString());
					this._isRecordedLive = (sourceType === VidiunSourceType.recordedLive.toString());
					this._hasDuration = (this._currentEntry.status !== VidiunEntryStatus.noContent && !this._isLive && this._currentEntry.mediaType.toString() !== VidiunMediaType.image.toString());
					this._isClip = !this._isRecordedLive && (this._currentEntry.id !== this._currentEntry.rootEntryId);
				}
			}
		);
	}

	openPreviewAndEmbed() {
		alert("Open Preview & Embed Window");
	}

	openLandingPage(landingPage: string) {
		this.browserService.openLink(landingPage);
	}

    navigateToEntry(entryId: string): void {
        this._entryStore.openEntry(entryId);
    }

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

