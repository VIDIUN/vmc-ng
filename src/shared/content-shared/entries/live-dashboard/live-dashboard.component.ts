import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';

@Component({
  selector: 'vLiveDashboard',
  templateUrl: './live-dashboard.component.html',
  styleUrls: ['./live-dashboard.component.scss']
})
export class LiveDashboardComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;

  @Input() parentPopupWidget: PopupWidgetComponent;


  constructor(private _logger: VidiunLogger) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this._logger.warn(`error occurred while trying to initialize LiveDashboardComponent, Please provide entry ID`);
      return undefined;
    }
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
