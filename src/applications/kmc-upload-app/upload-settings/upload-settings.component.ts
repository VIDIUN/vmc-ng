import { AfterViewInit, Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { UploadManagement } from '@vidiun-ng/vidiun-common';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { NewEntryUploadFile, NewEntryUploadService } from 'app-shared/vmc-shell';
import { AreaBlockerMessage, FileDialogComponent } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { TranscodingProfileManagement } from 'app-shared/vmc-shared/transcoding-profile-management';
import { globalConfig } from 'config/global';
import { urlRegex } from '@vidiun-ng/vidiun-ui';
import { UpdateEntriesListEvent } from 'app-shared/vmc-shared/events/update-entries-list-event';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { NewEntryCreateFromUrlService } from 'app-shared/vmc-shell/new-entry-create-from-url';
import { AppEventsService } from 'app-shared/vmc-shared';

export enum VMCFileCreationType {
    upload = 'upload',
    import = 'import'
}

export interface UploadSettingsFile {
    url?: string;
  file?: File;
  mediaType?: VidiunMediaType;
  name?: string;
  isEditing?: boolean;
  hasError?: boolean;
  errorToken?: string;
  size?: number;
}


@Component({
  selector: 'vVMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss']
})
export class UploadSettingsComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() creationType = VMCFileCreationType.upload;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild('fileDialog') _fileDialog: FileDialogComponent;

    public _creationTypes = VMCFileCreationType;
    public _uploadBtnLabel: string;
    public _title: string;
  public _tableScrollableWrapper: Element;
  public _transcodingProfiles: { value: number, label: string }[];
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError: AreaBlockerMessage;
  public _transcodingProfileLoading = false;
  public _files: UploadSettingsFile[] = [];
  public _fileTypes: SelectItem[] = [
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.video'),
      'value': VidiunMediaType.video
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.audio'),
      'value': VidiunMediaType.audio
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.image'),
      'value': VidiunMediaType.image
    },
  ];

  public _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
  `;

  constructor(private _newEntryUploadService: NewEntryUploadService,
              private _newEntryCreateFromUrlService: NewEntryCreateFromUrlService,
              private _formBuilder: FormBuilder,
              private _appEvents: AppEventsService,
              private _transcodingProfileManagement: TranscodingProfileManagement,
              private _uploadManagement: UploadManagement,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
  }

  ngAfterViewInit(): void {
      setTimeout(()=>{
          this._addFile();
      },0);


    this._tableScrollableWrapper = document.querySelector('.vUploadSettings .ui-table-scrollable-body');
  }

  ngOnDestroy() {

  }

  ngOnInit() {
    this._loadTranscodingProfiles();
      this._uploadBtnLabel = this._appLocalization.get('applications.upload.uploadSettings.upload');
      this._title = this.creationType === VMCFileCreationType.import
          ? this._appLocalization.get('applications.upload.uploadSettings.uploadFromUrl')
          : this._appLocalization.get('applications.upload.uploadSettings.uploadSettings');
  }

  public _handleSelectedFiles(files: FileList) {
    const isEditing = false;

    const newItems = Array.from(files).map(file => {
      const ext = this._getFileExtension(file.name);
      const mediaType = this._getMediaTypeFromExtension(ext);
      const name = file.name.replace(/\.[^.]*$/, '');
      const { size } = file;
      return ({ file, mediaType, name, size, isEditing });
    });

    this._files = [...this._files, ...newItems];
  }

  private _getFileExtension(filename: string): string {
  	const extension = /(?:\.([^.]+))?$/.exec(filename)[1];
    return typeof extension === "undefined" ? '' : extension.toLowerCase();
  }

  private _getMediaTypeFromExtension(extension: string): VidiunMediaType | null {
    const imageFiles = ['jpg', 'jpeg', 'gif', 'png'];
    const audioFiles = [
      'flv', 'asf', 'qt', 'mov', 'mpg',
      'avi', 'wmv', 'mp3', 'wav', 'ra',
      'rm', 'wma', 'aif', 'm4a'
    ];
    const videoFiles = [
      'flv', 'asf', 'qt', 'mov', 'mpg',
      'avi', 'wmv', 'mp4', '3gp', 'f4v',
      'm4v', 'mpeg', 'mxf', 'rm', 'rv',
      'rmvb', 'ts', 'ogg', 'ogv', 'vob',
      'webm', 'mts', 'arf', 'mkv'
    ];

    switch (true) {
      case videoFiles.indexOf(extension) !== -1:
        return VidiunMediaType.video;
      case audioFiles.indexOf(extension) !== -1:
        return VidiunMediaType.audio;
      case imageFiles.indexOf(extension) !== -1:
        return VidiunMediaType.image;
      default:
        return null;
    }
  }


  private _loadTranscodingProfiles() {
    this._transcodingProfileLoading = true;

    this._transcodingProfileManagement.get()
      .subscribe(
        profiles => {
          this._transcodingProfileLoading = false;
          const transcodingProfiles = [...profiles];
          const defaultProfileIndex = transcodingProfiles.findIndex(({ isDefault }) => !!isDefault);
          if (defaultProfileIndex !== -1) {
            const [defaultProfile] = transcodingProfiles.splice(defaultProfileIndex, 1);
            this._transcodingProfiles = [
              { label: defaultProfile.name, value: defaultProfile.id },
              ...transcodingProfiles.map(({ name: label, id: value }) => ({ label, value }))
            ];
            this._transcodingProfileField.setValue(defaultProfile.id);
          } else {
            this._transcodingProfiles = transcodingProfiles.map(({ name: label, id: value }) => ({ label, value }));
            this._transcodingProfileField.setValue(this._transcodingProfiles[0].value);
          }
        },
        (error) => {
          this._transcodingProfileError = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._transcodingProfileError = null;
                  this._transcodingProfileLoading = false;
                  this._loadTranscodingProfiles();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._transcodingProfileError = null;
                  this._transcodingProfileLoading = false;
                  this.parentPopupWidget.close();
                }
              }
            ]
          });
        });
  }

  private _uploadFiles(transcodingProfileId: number): void {
      if (this._files.some(({ isEditing }) => isEditing)) {
          return;
      }

      if (this._validateUploadFiles(this._files)) {
          this.parentPopupWidget.close();
          const uploadFileDataList = this._files.map(fileData => ({
              file: fileData.file,
              mediaType: fileData.mediaType,
              entryName: fileData.name
          }));

          this._newEntryUploadService.upload(uploadFileDataList, transcodingProfileId);
      }
  }

    private _importFiles(transcodingProfileId: number): void {
        const isValid = this._validateImportFiles(this._files);
        if (!isValid) {
            return;
        }

        const importFileDataList = this._files.map(file => ({ fileUrl: file.url }));

        this._newEntryCreateFromUrlService.import(importFileDataList, transcodingProfileId)
            .pipe(
                cancelOnDestroy(this),
                tag('block-shell')
            )
            .subscribe(
                () => {
                    this._appEvents.publish(new UpdateEntriesListEvent());
                    this.parentPopupWidget.close();
                },
                error => {
                    this._transcodingProfileError = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._transcodingProfileError = null;
                                this._appEvents.publish(new UpdateEntriesListEvent());
                                this.parentPopupWidget.close();
                            }
                        }]
                    });
                }
            );
    }

  public _removeFile(file: UploadSettingsFile): void {
    const fileIndex = this._files.indexOf(file);
    if (fileIndex !== -1) {
      const newList = Array.from(this._files);
      newList.splice(fileIndex, 1);
      this._files = newList;
    }
  }

  public _upload(): void {
      const transcodingProfileId = Number(this._profileForm.value.transcodingProfile);
      if (Number.isNaN(transcodingProfileId)) {
          this._transcodingProfileError = new AreaBlockerMessage({
              message: this._appLocalization.get('applications.upload.validation.missingTranscodingProfile'),
              buttons: [{
                  label: this._appLocalization.get('app.common.ok'),
                  action: () => this._transcodingProfileError = null
              }]
          });
          return;
      }

      if (this.creationType === VMCFileCreationType.import) {
          this._importFiles(transcodingProfileId);
      } else {
          this._uploadFiles(transcodingProfileId);
      }
  }

    private _validateImportFiles(files: UploadSettingsFile[]): boolean {
        let isValid = true;

        files.forEach((file) => {
            file.errorToken = null;
            file.hasError = false;

            const url = file.url ? file.url.trim() : '';
            if (!url) {
                isValid = false;
                file.hasError = true;
                file.errorToken = 'applications.upload.validation.emptyUrl';
            } else if (!urlRegex.test(url)) {
                isValid = false;
                file.hasError = true;
                file.errorToken = 'applications.upload.validation.invalidUrl';
            }
        });

        return isValid;
    }

  private _validateUploadFiles(files: UploadSettingsFile[]): boolean {

    let result = true;
    const allowedTypes = [VidiunMediaType.audio, VidiunMediaType.video, VidiunMediaType.image];
    const maxFileSize = globalConfig.vidiunServer.maxUploadFileSize;

    files.forEach(file => {
      const fileSize = file.size / 1024 / 1024; // convert to Mb

      if (allowedTypes.indexOf(file.mediaType) === -1) {
        result = false;
        file.errorToken = 'applications.upload.validation.wrongType';
        file.hasError = true;
      } else if (!(this._uploadManagement.supportChunkUpload(new NewEntryUploadFile(null, null, null, null)) || fileSize < maxFileSize)) {
        result = false;
        file.hasError = true;
        file.errorToken = 'applications.upload.validation.fileSizeExceeded';
      } else {
        file.hasError = false;
        file.errorToken = null;
      }
    });

    return result;
  }

  public _updateFileValidityOnTypeChange(file: UploadSettingsFile): void {
    if (file.hasError && file.errorToken === 'applications.upload.validation.wrongType') {
      file.errorToken = null;
      file.hasError = false;
    }
  }

  public _editName(file: UploadSettingsFile): void {
    file.isEditing = true;
  }

  public _cancelEdit(file: UploadSettingsFile): void {
    const name = file.name.trim() || '';

    if (name) {
      file.isEditing = file.hasError = false;
      file.name = name;
    } else {
      file.hasError = true;
      file.errorToken = 'applications.upload.validation.fileNameRequired';
    }
  }

    public _addFile(): void {
      if (this.creationType === VMCFileCreationType.import) {
          setTimeout(() => {
              this._files = [...this._files, { url: '' }];
          }, 0);
      } else {
          this._fileDialog.open();
      }
    }
}
