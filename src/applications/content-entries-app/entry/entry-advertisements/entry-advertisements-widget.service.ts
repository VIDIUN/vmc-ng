import {Injectable, OnDestroy} from '@angular/core';
import {EntryWidget} from '../entry-widget';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import { EntryStore } from '../entry-store.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
@Injectable()
export class EntryAdvertisementsWidget extends EntryWidget implements OnDestroy {

    constructor(logger: VidiunLogger) {
        super(ContentEntryViewSections.Advertisements, logger);
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
    }

    ngOnDestroy() {
    }

    protected onActivate(firstTimeActivating: boolean) {
    }
}
