import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UsageDashboardComponent} from './usage-dashboard.component';
import {VidiunUIModule} from '@vidiun-ng/vidiun-ui';
import {routing} from './usage-dashboard-app.routes';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    VidiunUIModule
  ],
  declarations: [
    UsageDashboardComponent
  ],
  exports: [],
  providers: [],
})
export class UsageDashboardAppModule {
}
