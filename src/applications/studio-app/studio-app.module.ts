import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioV2Component } from './studio-v2.component';
import { StudioV3Component } from './studio-v3.component';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import { routing } from './studio-app.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    VidiunUIModule
  ],
  declarations: [
    StudioV2Component,
    StudioV3Component
  ],
  exports: [],
  providers: [],
})
export class StudioAppModule {
}
