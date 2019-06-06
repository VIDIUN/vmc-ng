import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckboxModule, SharedModule } from 'primeng/primeng';

import { AppShellService } from './providers/app-shell.service';
import { BrowserService } from './providers/browser.service';
import { AppContainerComponent } from './components/app-container/app-container.component';
import { ReleaseNotesComponent } from './components/release-notes/release-notes.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { EntryTypePipe } from 'app-shared/vmc-shell/pipes/entry-type.pipe';
import { PageExitVerificationService, UploadPageExitVerificationService } from 'app-shared/vmc-shell/page-exit-verification';
import { DatePipe } from 'app-shared/vmc-shared/date-format/date.pipe';

@NgModule({
    imports: <any[]>[
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule
    ],
    declarations: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
    ],
    exports: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
    ],
    providers: <any[]>[]
})
export class VMCShellModule {
    constructor(@Optional() @Self()  _uploadPageExitVerificationService: UploadPageExitVerificationService,
                @Optional() @Self()  _browserService: BrowserService) {
        if (_uploadPageExitVerificationService) {
            _uploadPageExitVerificationService.init();
        }

        if (_browserService) {
            _browserService.initLocationListener();
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: VMCShellModule,
            providers: <any[]>[
                BrowserService,
                AppShellService,
                PageExitVerificationService,
                UploadPageExitVerificationService
            ]
        };
    }
}
