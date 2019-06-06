import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReachFrameComponent } from './reach-frame.component';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';
import { LocalizationModule } from '@vidiun-ng/mc-shared';

@NgModule({
    imports: [
        CommonModule,
        VidiunUIModule,
        LocalizationModule
    ],
    declarations: [
        ReachFrameComponent,
    ],
    exports: [
        ReachFrameComponent,
    ]
})
export class ReachFrameModule {
}
