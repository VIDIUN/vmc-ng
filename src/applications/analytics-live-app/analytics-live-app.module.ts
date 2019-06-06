import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routing} from './analytics-live-app.routes';
import {AnalyticsLiveComponent} from './analytics-live.component';
import {VidiunUIModule} from '@vidiun-ng/vidiun-ui';
import { AnalyticsLiveModule } from 'app-shared/vmc-shared/analytics-live/analytics-live.module';
import { LocalizationModule } from '@vidiun-ng/mc-shared';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        VidiunUIModule,
        AnalyticsLiveModule,
        LocalizationModule
    ],
    declarations: [
        AnalyticsLiveComponent
    ],
    exports: [],
    providers: [
    ],
})
export class AnalyticsLiveAppModule {
}
