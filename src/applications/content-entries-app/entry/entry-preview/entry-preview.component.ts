import {Component, OnDestroy, OnInit} from '@angular/core';
import {EntryPreviewWidget} from './entry-preview-widget.service';
import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunEntryStatus} from 'vidiun-ngx-client';
import {AppEventsService} from 'app-shared/vmc-shared';
import {PreviewAndEmbedEvent} from 'app-shared/vmc-shared/events';
import {AppLocalization} from '@vidiun-ng/mc-shared';
import {VMCPermissionsService} from 'app-shared/vmc-shared/vmc-permissions/vmc-permissions.service';
import {VMCPermissions} from 'app-shared/vmc-shared/vmc-permissions';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { ClipAndTrimAppViewService } from 'app-shared/vmc-shared/vmc-views/component-views';
import { EntryStore } from '../entry-store.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
	selector: 'vEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss'],
  providers: [
    VidiunLogger.createLogger('EntryPreviewComponent')
  ]
})
export class EntryPreview implements OnInit, OnDestroy {

	public _actionLabel: string;
  public _clipAndTrimEnabled = false;
    public _clipAndTrimDisabledReason: string = null;
    public _previewDisabled = false;


  private _currentEntry: VidiunMediaEntry;


	constructor(public _widgetService: EntryPreviewWidget,
              private _appLocalization: AppLocalization,
                private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
                private _permissionsService: VMCPermissionsService,
              private _appEvents: AppEventsService,
                private _store: EntryStore) {
	}

	private _checkClipAndTrimAvailability(): void {

	    if (this._currentEntry) {
            this._clipAndTrimEnabled = this._clipAndTrimAppViewService.isAvailable({
                entry: this._currentEntry,
                hasSource: this._store.hasSource.value()
            });
        } else {
            this._clipAndTrimEnabled = false;
        }
    }

	ngOnInit() {
        const hasEmbedPermission = this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_EMBED_CODE);
        this._actionLabel = hasEmbedPermission
            ? this._appLocalization.get('applications.content.entryDetails.preview.pande')
            : this._appLocalization.get('applications.content.entryDetails.preview.previewInPlayer');

        this._widgetService.attachForm();

        this._store.hasSource.value$
            .pipe(cancelOnDestroy(this))
            .subscribe(
                data => {
                    this._checkClipAndTrimAvailability();
                });

        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .subscribe(
            data => {
                if (data) {
                    this._currentEntry = data;
                    const entryHasContent = this._currentEntry.status.toString() !== VidiunEntryStatus.noContent.toString();

                    this._previewDisabled = !entryHasContent;
                }

                this._checkClipAndTrimAvailability();

            }
        );
    }

	openPreviewAndEmbed() {
		this._appEvents.publish(new PreviewAndEmbedEvent(this._currentEntry));
	}

	ngOnDestroy() {
		this._widgetService.detachForm();
	}
}

