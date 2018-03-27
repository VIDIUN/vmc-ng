import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntrySchedulingWidget } from './entry-scheduling-widget.service';

import { subApplicationsConfig } from 'config/sub-applications';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kEntryScheduling',
    templateUrl: './entry-scheduling.component.html',
    styleUrls: ['./entry-scheduling.component.scss']
})
export class EntryScheduling implements AfterViewInit, OnInit, OnDestroy {
    public _kmcPermissions = KMCPermissions;
    public _loading = false;
    public _loadingError = null;

	_enableEndDate: boolean;

	public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;

    constructor(
        public _widgetService: EntrySchedulingWidget
	) {}


    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }


    ngAfterViewInit() {

    }
}

