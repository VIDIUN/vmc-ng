import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFrameComponent } from './analytics-frame.component';
import { AnalyticsComponent } from './analytics.component';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import {routing} from './analytics.routes';
import {RouterModule} from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        VidiunUIModule
    ],
    declarations: [
        AnalyticsFrameComponent,
        AnalyticsComponent
    ],
    providers: [],
    exports: []
})
export class AnalyticsModule {
}
