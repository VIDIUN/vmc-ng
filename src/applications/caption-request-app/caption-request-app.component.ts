import { Component, OnDestroy, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AppEventsService } from 'app-shared/vmc-shared';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { CaptionRequestEvent } from 'app-shared/vmc-shared/events';
import { ReachData } from 'app-shared/vmc-shared/reach-frame';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { ReachPages } from 'app-shared/vmc-shared/vmc-views/details-views';

@Component({
    selector: 'vCaptionRequest',
    templateUrl: './caption-request-app.component.html',
    styleUrls: ['./caption-request-app.component.scss'],
    providers: [VidiunLogger.createLogger('CaptionRequestAppComponent')]
})
export class CaptionRequestAppComponent implements OnDestroy {
    @ViewChild('captionRequest') captionRequest: PopupWidgetComponent;

    public _data: ReachData;
    public _page: ReachPages;

    constructor(private _logger: VidiunLogger,
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
                    this._logger.warn('Cannot open caption request (window already open?)');
                }
            });
    }

    ngOnDestroy() {

    }
}

