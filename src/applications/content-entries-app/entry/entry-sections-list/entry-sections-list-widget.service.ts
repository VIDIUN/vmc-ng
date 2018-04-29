import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppLocalization} from "@kaltura-ng/kaltura-common";
import {SectionsList} from './sections-list';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {EntryWidget} from '../entry-widget';
import {
    ContentEntryViewSections,
    ContentEntryViewService
} from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';

export interface SectionWidgetItem {
    label: string;
    isValid: boolean;
    attached: boolean;
    key: ContentEntryViewSections;
}

@Injectable()
export class EntrySectionsListWidget extends EntryWidget implements OnDestroy
{
    private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
    public sections$ : Observable<SectionWidgetItem[]> = this._sections.asObservable();

    constructor(private _appLocalization: AppLocalization,
                private _contentEntryViewService: ContentEntryViewService)
    {
        super('sectionsList');
    }

    protected onDataLoading(dataId : any) : void {
        this._clearSectionsList();
    }

    protected onActivate(firstTimeActivating: boolean)
    {
        if (firstTimeActivating)
        {
            this._initialize();
        }
    }

    protected onDataLoaded(data : KalturaMediaEntry) : void {
        this._reloadSections(data);
    }

    private _initialize() : void {
        this.form.widgetsState$
            .cancelOnDestroy(this)
            .subscribe(
                sectionsState => {
                    this._sections.getValue().forEach((section: SectionWidgetItem) => {
                        const sectionState = sectionsState[section.key];
                        const isValid = (!sectionState || sectionState.isBusy || sectionState.isValid || !sectionState.isActive);
                        const isAttached = (!!sectionState && sectionState.isAttached);

                        if (section.attached !== isAttached || section.isValid !== isValid) {
                            section.attached = isAttached;
                            section.isValid = isValid;
                        }
                    });
                }
            );
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {

    }

    private _clearSectionsList() : void
    {
        this._sections.next([]);

    }

    private _reloadSections(entry : KalturaMediaEntry) : void
    {
        const sections = [];
        const formWidgetsState = this.form.widgetsState;

        if (entry) {
            SectionsList.forEach((section) => {

                const sectionFormWidgetState =  formWidgetsState ? formWidgetsState[section.key] : null;
                const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

                if (this._contentEntryViewService.isAvailable({ section: section.key, entry })) {
                    sections.push(
                        {
                            label: this._appLocalization.get(section.label),
                            active: isSectionActive,
                            hasErrors: sectionFormWidgetState ? sectionFormWidgetState.isValid : false,
                            key: section.key
                        }
                    );
                }
            });
        }

        this._sections.next(sections);
    }

    ngOnDestroy() {

    }
}
