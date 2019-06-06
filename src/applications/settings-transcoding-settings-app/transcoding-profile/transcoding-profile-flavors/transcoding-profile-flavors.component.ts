import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VidiunFlavorParams } from 'vidiun-ngx-client';
import { TranscodingProfileFlavorsWidget } from './transcoding-profile-flavors-widget.service';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vTranscodingProfilesFlavors',
  templateUrl: './transcoding-profile-flavors.component.html',
  styleUrls: ['./transcoding-profile-flavors.component.scss'],
  providers: [VidiunLogger.createLogger('TranscodingProfileFlavorsComponent')]
})
export class TranscodingProfileFlavorsComponent implements OnInit, OnDestroy {
  @ViewChild('editMediaProfileFlavor') _editMediaProfileFlavorPopup: PopupWidgetComponent;
  @ViewChild('editLiveProfileFlavor') _editLiveProfileFlavorPopup: PopupWidgetComponent;

  public _selectedFlavor: VidiunFlavorParams;

  constructor(public _widgetService: TranscodingProfileFlavorsWidget,
              private _logger: VidiunLogger) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _editFlavor(flavor: VidiunFlavorParams): void {
    this._logger.info(`handle edit flavor action by user`, { id: flavor.id, name: flavor.name });
    this._selectedFlavor = flavor;

    if (this._widgetService.data.type === VidiunConversionProfileType.media) {
      this._editMediaProfileFlavorPopup.open();
    } else if (this._widgetService.data.type === VidiunConversionProfileType.liveStream) {
      this._editLiveProfileFlavorPopup.open();
    }
  }
}
