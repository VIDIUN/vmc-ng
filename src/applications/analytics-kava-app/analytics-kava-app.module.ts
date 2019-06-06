import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routing} from './analytics-kava-app.routes';
import {AnalyticsKavaComponent} from './analytics-kava.component';
import {VidiunUIModule} from '@vidiun-ng/vidiun-ui';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        VidiunUIModule
    ],
    declarations: [
        AnalyticsKavaComponent
    ],
    exports: [],
    providers: [
    ],
})
export class AnalyticsKavaAppModule {
}
