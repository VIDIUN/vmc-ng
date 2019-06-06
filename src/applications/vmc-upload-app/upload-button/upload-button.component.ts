import {Component, ViewChild} from '@angular/core';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import {VidiunMediaType} from 'vidiun-ngx-client';
import {PrepareEntryComponent} from '../prepare-entry/prepare-entry.component';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { VMCFileCreationType } from '../upload-settings/upload-settings.component';

@Component({
  selector: 'vUploadButton',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
})
export class UploadButtonComponent {
  @ViewChild('uploadmenu') uploadMenuPopup: PopupWidgetComponent;
  @ViewChild('uploadsettings') uploadSettingsPopup: PopupWidgetComponent;
  @ViewChild('createLive') createLivePopup: PopupWidgetComponent;
  @ViewChild('prepareEntry') prepareEntryComponent: PrepareEntryComponent;
  @ViewChild('bulkuploadmenu') bulkUploadMenu: PopupWidgetComponent;
  @ViewChild('createFromYoutube') createFromYoutube: PopupWidgetComponent;

    public _disabled = true;
    public _creationTypes = VMCFileCreationType;
    public _creationType = this._creationTypes.upload;

  constructor(private _appPermissions: VMCPermissionsService) {
      this._disabled = !this._appPermissions.hasAnyPermissions([
          VMCPermissions.CONTENT_INGEST_UPLOAD,
          VMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
          VMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO,
          VMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO,
          VMCPermissions.LIVE_STREAM_ADD
      ]);
  }

  _onMenuItemSelected(item: string): void {
    this.uploadMenuPopup.close();

    switch (item) {
      case 'uploadFromDesktop':
          this._creationType = VMCFileCreationType.upload;
          this.uploadSettingsPopup.open();
        break;
      case 'bulkUpload':
        this.bulkUploadMenu.open();
        break;
      case 'prepareVideoEntry':
        this.prepareEntryComponent.prepareEntry(VidiunMediaType.video);
        break;
      case 'prepareAudioEntry':
        this.prepareEntryComponent.prepareEntry(VidiunMediaType.audio);
        break;
      case 'createLive':
        this.createLivePopup.open();
        break;
    case 'createFromUrl':
        this._creationType = VMCFileCreationType.import;
        this.uploadSettingsPopup.open();
        break;
    case 'createFromYoutube':
        this.createFromYoutube.open();
        break;
      default:
        break;
    }
  }
}

