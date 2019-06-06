import {Component, EventEmitter, Output} from '@angular/core';
import {BrowserService} from 'app-shared/vmc-shell';
import { serverConfig } from 'config/server';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vVMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onItemSelected = new EventEmitter<string>();

  public _vmcPermissions = VMCPermissions;
  public _showHighSpeedLink: boolean;
  public _enableHighSpeedLink: boolean;
  public _showNeedHighSpeedLink: boolean;
  public _enableNeedHighSpeedLink: boolean;
  public _enableBulkUploadSamples: boolean;
    public _uploadFromYoutubeAllowed = !!serverConfig.externalAPI && !!serverConfig.externalAPI.youtube;
    public _bulkUploadAvailable: boolean;

  constructor(private _browserService: BrowserService,
              private _permissionsService: VMCPermissionsService) {
      this._showHighSpeedLink = this._permissionsService.hasPermission(VMCPermissions.FEATURE_SHOW_ASPERA_UPLOAD_BUTTON);
      this._enableHighSpeedLink =  !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.highSpeedUpload;
      this._showNeedHighSpeedLink = !!serverConfig.externalLinks.uploads && !this._showHighSpeedLink && !this._permissionsService.hasPermission(VMCPermissions.FEATURE_HIDE_ASPERA_LINK);
      this._enableNeedHighSpeedLink = !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.needHighSpeedUpload;
      this._enableBulkUploadSamples = !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.bulkUploadSamples;
      this._bulkUploadAvailable = this._permissionsService.hasAnyPermissions([
          VMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
          VMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
          VMCPermissions.ADMIN_USER_BULK,
          VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS
      ]);
  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.highSpeedUpload);
  }

    onNeedHighSpeedLinkClicked() {
        this._browserService.openLink(serverConfig.externalLinks.uploads.needHighSpeedUpload);
    }

  onDownloadSamplesClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.bulkUploadSamples);
  }

}
