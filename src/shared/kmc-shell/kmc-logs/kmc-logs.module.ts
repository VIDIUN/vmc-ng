import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule, DropdownModule, SharedModule } from 'primeng/primeng';
import { TranslateModule } from '@ngx-translate/core';
import { PowerUserConsoleModule } from '@vidiun-ng/mc-shared';
import { LogsRecordComponent } from 'app-shared/vmc-shell/vmc-logs/logs-record/logs-record.component';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';
import { VmcLoggerConfigurator } from 'app-shared/vmc-shell/vmc-logs/vmc-logger-configurator';
import { PowerUserConsoleComponent } from 'app-shared/vmc-shell/vmc-logs/power-user-console/power-user-console.component';
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: <any[]>[
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule,
        TranslateModule,
        PowerUserConsoleModule,
        PopupWidgetModule,
        DropdownModule,
        ButtonModule
    ],
    declarations: <any[]>[
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    exports: <any[]>[
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    providers: <any[]>[]
})
export class VmcLogsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: VmcLogsModule,
            providers: <any[]>[
                VmcLoggerConfigurator
            ]
        };
    }
}
