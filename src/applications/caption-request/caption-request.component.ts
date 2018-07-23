import { Component, OnDestroy, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AppEventsService } from 'app-shared/kmc-shared';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { CaptionRequestEvent } from 'app-shared/kmc-shared/events';
import { ReachData } from 'app-shared/kmc-shared/reach-frame';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { ReachPages } from 'app-shared/kmc-shared/kmc-views/component-views';

@Component({
    selector: 'kCaptionRequest',
    templateUrl: './caption-request.component.html',
    styleUrls: ['./caption-request.component.scss'],
    providers: [KalturaLogger.createLogger('CaptionRequestComponent')]
})
export class CaptionRequestComponent implements OnDestroy {
    @ViewChild('captionRequest') captionRequest: PopupWidgetComponent;

    public _data: ReachData;
    public _page: ReachPages;

    constructor(private _logger: KalturaLogger,
                appEvents: AppEventsService) {
        appEvents.event(CaptionRequestEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({ data, page }) => {
                this._logger.info(`handle open caption request window event`, { data, page });
                this._data = data;
                this._page = page;
                if (!this.captionRequest.isShow) {
                    this.captionRequest.open();
                } else {
                    this._logger.info('Cannot open caption request (window already open?)');
                }
            });
    }

    ngOnDestroy() {

    }
}

