import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { SectionWidgetItem, EntrySectionsListHandler } from './entry-sections-list-handler';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';

import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntryFormManager } from '../entry-form-manager';



@Component({
  selector: 'kEntrySectionsList',
  templateUrl: './entry-sections-list.component.html',
  styleUrls: ['./entry-sections-list.component.scss']
})
export class EntrySectionsList implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('entrySections') private entrySections: StickyComponent;

    public _loading = false;
    public _showList = false;
    public _sections : SectionWidgetItem[] = [];

    constructor(public _widgetService: EntrySectionsListHandler, public _entryStore : EntryStore)  {
    }


    public navigateToSection(widget : SectionWidgetItem) : void
    {
	    window.scrollTo(0,0);
        this._entryStore.openSection(widget.key);
    }


    ngOnInit() {
		this._loading = true;
        this._widgetService.attachForm();

        this._widgetService.sections$
        .cancelOnDestroy(this)
        .subscribe(
			sections =>
			{
				this._loading = false;
			    this._sections = sections;
			    this._showList = sections && sections.length > 0;
			    this.entrySections.updateLayout();
			}
		);
	}

    ngOnDestroy() {
        this._widgetService.detachForm();
    }


    ngAfterViewInit() {

    }

}

