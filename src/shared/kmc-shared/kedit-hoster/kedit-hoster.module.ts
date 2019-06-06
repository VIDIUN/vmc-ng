import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VidiunUIModule} from '@vidiun-ng/vidiun-ui';
import {VeditHosterComponent} from 'app-shared/vmc-shared/vedit-hoster/vedit-hoster.component';

@NgModule({
  imports: <any[]>[
      CommonModule,
      VidiunUIModule
  ],
  declarations: <any[]>[
      VeditHosterComponent
  ],
  exports: <any[]>[VeditHosterComponent],
  providers: <any[]>[
  ]
})
export class VEditHosterModule {
}
