import {Component, OnDestroy, OnInit} from '@angular/core';

import {EntryClipsWidget} from './entry-clips-widget.service';
import {serverConfig} from 'config/server';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";


@Component({
    selector: 'kEntryClips',
    templateUrl: './entry-clips.component.html',
    styleUrls: ['./entry-clips.component.scss']
})
export class EntryClips implements OnInit, OnDestroy {

    public _clipAndTrimEnabled = false;

    constructor(public _widgetService: EntryClipsWidget, logger: KalturaLogger) {
      this._clipAndTrimEnabled = serverConfig.externalApps.clipAndTrim.enabled;
      if (!this._clipAndTrimEnabled) {
        logger.warn('Clip and trim (kedit) is not enabled, please check configuration');
      }
    }

    _convertSortValue(value: boolean): number {
        return value ? 1 : -1;

    }
    public _onSortChanged(event: any)
    {
        this._widgetService.sortAsc = event.order === 1;
        this._widgetService.sortBy = event.field;

        this._widgetService.updateClips();
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.updateClips();
        }
    }

    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

