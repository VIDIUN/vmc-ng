import { Component } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
    selector: 'v-power-user-console',
    templateUrl: './power-user-console.component.html',
    styleUrls: ['./power-user-console.component.scss'],
    providers: [VidiunLogger.createLogger('LogsRecordComponent')]
})
export class PowerUserConsoleComponent {
    public _display = false;

    constructor(private _logger: VidiunLogger) {

    }

    public _openPowerUserPanel(): void {
        this._logger.info('open powerUserConsole by user');
        this._display = true;
    }
}
