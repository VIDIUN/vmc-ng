import { Component, Input } from '@angular/core';
import { VidiunLiveEntry } from 'vidiun-ngx-client';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';

@Component({
    selector: 'vAnalyticsLive',
    templateUrl: './analytics-live.component.html',
    styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {
    @Input() entry: VidiunLiveEntry;
    @Input() parentPopup: PopupWidgetComponent;
}
