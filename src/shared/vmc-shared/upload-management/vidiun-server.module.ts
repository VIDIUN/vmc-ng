import { NgModule } from '@angular/core';
import { VidiunClientModule } from 'vidiun-ngx-client';
import { UploadFileAdapterToken, UploadManagementModule } from '@vidiun-ng/vidiun-common';
import { VidiunUploadAdapter } from './vidiun-upload-adapter.service';

@NgModule({
    imports: <any[]>[
        VidiunClientModule,
        UploadManagementModule
    ],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[
        {
            provide : UploadFileAdapterToken,
            useClass : VidiunUploadAdapter,
            multi : true
        }
    ]
})
export class VidiunServerModule {

}
