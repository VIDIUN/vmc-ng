import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VMCPermissionsService } from './vmc-permissions.service';
import { HiddenIfNotPermittedPipe } from 'app-shared/vmc-shared/vmc-permissions/hidden-if-not-permitted.pipe';
import { DisabledIfNotPermittedPipe } from 'app-shared/vmc-shared/vmc-permissions/disabled-if-not-permitted.pipe';
import { NgIfPermittedPipe } from 'app-shared/vmc-shared/vmc-permissions/ng-if-permitted.pipe';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        HiddenIfNotPermittedPipe,
        DisabledIfNotPermittedPipe,
        NgIfPermittedPipe
        ],
    exports: [
        HiddenIfNotPermittedPipe,
        DisabledIfNotPermittedPipe,
        NgIfPermittedPipe,
        ]
})
export class VMCPermissionsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: VMCPermissionsModule,
            providers: <any[]>[
                VMCPermissionsService
            ]
        };
    }
}