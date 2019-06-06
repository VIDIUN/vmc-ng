import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesDashboardComponent } from './services-dashboard.component';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import { routing } from './services-dashboard-app.routes';
import { RouterModule } from '@angular/router';
import { ReachFrameModule } from 'app-shared/vmc-shared';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        VidiunUIModule,
        ReachFrameModule
    ],
    declarations: [
        ServicesDashboardComponent
    ],
    exports: [],
    providers: [],
})
export class ServicesDashboardAppModule {
}
