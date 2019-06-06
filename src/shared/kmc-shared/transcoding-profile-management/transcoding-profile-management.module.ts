import { ModuleWithProviders, NgModule } from '@angular/core';
import { VidiunClientModule } from 'vidiun-ngx-client';
import { TranscodingProfileManagement } from './transcoding-profile-management.service';

@NgModule({
  imports: <any[]>[
    VidiunClientModule,
  ],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class TranscodingProfileManagementModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TranscodingProfileManagementModule,
      providers: <any[]>[
        TranscodingProfileManagement
      ]
    };
  }
}
