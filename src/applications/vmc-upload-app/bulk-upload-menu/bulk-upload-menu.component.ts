import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage, FileDialogComponent } from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { VidiunAPIException } from 'vidiun-ngx-client';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { BulkUploadService, BulkUploadTypes } from 'app-shared/vmc-shell/bulk-upload';
import { AppEventsService } from 'app-shared/vmc-shared';
import { BulkLogUploadingStartedEvent } from 'app-shared/vmc-shared/events';
import { VidiunBulkUpload } from 'vidiun-ngx-client';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentBulkUploadsMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
@Component({
  selector: 'vVMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
})
export class BulkUploadMenuComponent {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('fileDialog') fileDialog: FileDialogComponent;
  @ViewChild('uploadSucceed') uploadSucceed: PopupWidgetComponent;

  private _selectedType: BulkUploadTypes;
  private _extensions = {
    [BulkUploadTypes.entries]: '.xml,.csv',
    [BulkUploadTypes.categories]: '.csv',
    [BulkUploadTypes.endUsers]: '.csv',
    [BulkUploadTypes.endUsersEntitlement]: '.csv'
  };

  public _selectedFiles: FileList;
  public _bulkUploadTypes = BulkUploadTypes;
  public _allowedExtensions = '';
  public _showFileDialog = true;
  public _blockerMessage: AreaBlockerMessage;
  public _vmcPermissions = VMCPermissions;

  constructor(private _bulkUploadService: BulkUploadService,
              private _appLocalization: AppLocalization,
              private _userAuthentication: AppAuthentication,
              private _router: Router,
              private _contentBulkViewService: ContentBulkUploadsMainViewService,
              private _appEvents: AppEventsService) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog(): void {
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  private _handleUploadSuccess(response: VidiunBulkUpload): void {
    this._selectedFiles = null;
    this.uploadSucceed.open();
    this._appEvents.publish(new BulkLogUploadingStartedEvent(response.id, response.status, response.uploadedOn));
  }

  private _handleUploadError(error: VidiunAPIException): void {
    if (error.code === 'SERVICE_FORBIDDEN') {
      this._showErrorAlert(this._appLocalization.get(
        'applications.content.bulkUpload.menu.messages.uploadError.message',
        { value: error.message }
      ));
    } else if (error.code === 'INVALID_VS') {
        // todo vmcng
    } else {
      this._showErrorAlert(error.message);
    }
  }

  private _showErrorAlert(message: string): void {
    this._blockerMessage = new AreaBlockerMessage({
      message: message,
      buttons: [
        {
          label: this._appLocalization.get('app.common.retry'),
          action: () => {
            this._invokeUpload();
            this._blockerMessage = null;
          }
        },
        {
          label: this._appLocalization.get('app.common.cancel'),
          action: () => {
            this._selectedFiles = null;
            this._blockerMessage = null;
          }
        }
      ]
    });
  }

  private _invokeUpload(): void {
    if (this._selectedFiles) {
      this._bulkUploadService.upload(this._selectedFiles, this._selectedType)
        .pipe(tag('block-shell'))
        .subscribe(
          (response) => this._handleUploadSuccess(response),
          (error) => this._handleUploadError(error)
        );
    } else {
      console.warn('There are no selected files');
    }
  }

  private _getAllowedExtension(type: BulkUploadTypes): string {
    if (type in this._extensions) {
      return this._extensions[type];
    }

    throw Error('Bulk upload type is not supported');
  }

  public _selectFiles(files: FileList): void {
    this._selectedFiles = files;
    this._invokeUpload();
  }

  public _invokeFileSelection(type: BulkUploadTypes): void {
    this._selectedType = type;
    this._allowedExtensions = this._getAllowedExtension(type);
    this._openFileDialog();
  }

  public _goToBulkUploadLog(): void {
      this._contentBulkViewService.open();
    this.uploadSucceed.close();
    this.onClose.emit();
  }
}
