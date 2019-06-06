import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsLiveFrameComponent } from './analytics-live-frame.component';
import { AnalyticsLiveComponent } from './analytics-live.component';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';


@NgModule({
    imports: [
        CommonModule,
        VidiunUIModule
    ],
    declarations: [
        AnalyticsLiveFrameComponent,
        AnalyticsLiveComponent
    ],
    providers: [],
    exports: [
        AnalyticsLiveFrameComponent,
        AnalyticsLiveComponent
    ]
})
export class AnalyticsLiveModule {
}
