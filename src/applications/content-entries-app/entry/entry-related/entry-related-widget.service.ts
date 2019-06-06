import {
  Injectable,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  KeyValueDiffer,
  KeyValueDiffers,
  OnDestroy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { VidiunAssetFilter } from 'vidiun-ngx-client';
import { VidiunAttachmentAsset } from 'vidiun-ngx-client';
import { VidiunAttachmentType } from 'vidiun-ngx-client';
import { AttachmentAssetListAction } from 'vidiun-ngx-client';
import { VidiunUploadedFileTokenResource } from 'vidiun-ngx-client';
import { AttachmentAssetSetContentAction } from 'vidiun-ngx-client';
import { AttachmentAssetDeleteAction } from 'vidiun-ngx-client';
import { AttachmentAssetUpdateAction } from 'vidiun-ngx-client';
import { AttachmentAssetAddAction } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { TrackedFileStatuses, UploadManagement } from '@vidiun-ng/vidiun-common';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { NewEntryRelatedFile } from './new-entry-related-file';
import { EntryWidget } from '../entry-widget';
import { VidiunAttachmentAssetListResponse } from 'vidiun-ngx-client';
import { getVidiunServerUri } from 'config/server';
import { globalConfig } from 'config/global';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

export interface RelatedFile extends VidiunAttachmentAsset {
  uploading?: boolean,
  uploadFileId?: string,
  serverUploadToken?: string,
  uploadFailure?: boolean,
  progress?: string;
}

@Injectable()
export class EntryRelatedWidget extends EntryWidget implements OnDestroy
{

	relatedFilesListDiffer: IterableDiffer<RelatedFile>;
	relatedFileDiffer : { [key : string] : KeyValueDiffer<string,any> } = {};

	private _relatedFiles = new BehaviorSubject<{ items : RelatedFile[]}>(
		{ items : []}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable();

	private _entryId: string = '';

  constructor(private _vidiunServerClient: VidiunClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _appAuthentication: AppAuthentication,
              private _objectDiffers: KeyValueDiffers,
              private _listDiffers: IterableDiffers,
              private _uploadManagement: UploadManagement,
              logger: VidiunLogger) {
    super(ContentEntryViewSections.Related, logger);
  }


  private _trackUploadFiles(): void {
    this._uploadManagement.onTrackedFileChanged$
      .pipe(cancelOnDestroy(this))
      .filter(uploadedFile => uploadedFile.data instanceof NewEntryRelatedFile)
      .map(uploadedFile => {
        let relevantRelatedFile = null;
        if (uploadedFile.data instanceof NewEntryRelatedFile) {
          const relatedFiles = this._relatedFiles.getValue().items;
          relevantRelatedFile = relatedFiles ? relatedFiles.find(file => file.uploadFileId === uploadedFile.id) : null;
        }
        return { relevantRelatedFile, uploadedFile };
      })
      .filter(({ relevantRelatedFile }) => !!relevantRelatedFile)
      .subscribe(
        ({ relevantRelatedFile, uploadedFile }) => {
          switch (uploadedFile.status) {
            case TrackedFileStatuses.purged:
              this._removeFile(relevantRelatedFile);
              break;

            case TrackedFileStatuses.prepared:
              relevantRelatedFile.serverUploadToken = (<NewEntryRelatedFile>uploadedFile.data).serverUploadToken;
              this._syncBusyState();
              break;

            case TrackedFileStatuses.uploadCompleted:
              relevantRelatedFile.progress = 100;
              relevantRelatedFile.uploading = false;
              relevantRelatedFile.uploadFailure = false;
              break;

            case TrackedFileStatuses.cancelled:
              relevantRelatedFile.uploading = false;
              this._syncBusyState();
              break;

            case TrackedFileStatuses.failure:
              relevantRelatedFile.uploading = false;
              relevantRelatedFile.uploadFailure = true;
              this._syncBusyState();
              break;

            case TrackedFileStatuses.uploading:
              const progress = Number((uploadedFile.progress * 100).toFixed(0));
              relevantRelatedFile.progress = progress >= 100 ? 100 : progress;
              relevantRelatedFile.uploading = true;
              relevantRelatedFile.uploadFailure = false;
              break;
            default:
              break;
          }
        });
  }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
      this.relatedFileDiffer = {};
      this.relatedFilesListDiffer = null;
      this._entryId = '';
      this._relatedFiles.next({ items: [] });
    }

  protected onActivate(firstTimeActivating: boolean) {
    this._entryId = this.data.id;
    super._showLoader();

    if (firstTimeActivating) {
      this._trackUploadFiles();
    }

    this._relatedFiles.next({ items: [] });

    return this._vidiunServerClient.request(new AttachmentAssetListAction({
      filter: new VidiunAssetFilter({ entryIdEqual: this._entryId })
    }))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .map(response => {
        // Set file type and restore previous upload state
        this._updateAssetsResponse(response);

        this._relatedFiles.next({ items: response.objects });
        this.relatedFilesListDiffer = this._listDiffers.find([]).create();
        this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);

        this.relatedFileDiffer = {};
        this._relatedFiles.getValue().items.forEach((asset: RelatedFile) => {
          this.relatedFileDiffer[asset.id] = this._objectDiffers.find([]).create();
          this.relatedFileDiffer[asset.id].diff(asset);
        });
        super._hideLoader();

        return {failed: false};
      })
      .catch(error => {
          this._relatedFiles.next({ items: [] });
          super._hideLoader();
          super._showActivationError();
          return Observable.throw(error);
        }
      );
  }

  protected onDataSaving(data: VidiunMediaEntry, request: VidiunMultiRequest) {
    if (this._relatedFiles.getValue().items) {
      // check for added and removed assets
      if (this.relatedFilesListDiffer) {
        const changes = this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);
        if (changes) {
          changes.forEachAddedItem((record: IterableChangeRecord<RelatedFile>) => {
            // added assets
            const newAsset = record.item as RelatedFile;
            const addAssetRequest = new AttachmentAssetAddAction({ entryId: this.data.id, attachmentAsset: newAsset });
            request.requests.push(addAssetRequest);

            const resource = new VidiunUploadedFileTokenResource();
            resource.token = record.item.serverUploadToken;
            const setContentRequest = new AttachmentAssetSetContentAction({ id: '0', contentResource: resource })
              .setDependency(['id', (request.requests.length - 1), 'id'])
              .setCompletion(response => {
                if (response.error) {
                  this._uploadManagement.cancelUpload(newAsset.uploadFileId, true);
                } else {
                  const relevantUploadFile = this._uploadManagement.getTrackedFile(newAsset.uploadFileId);
                  if (relevantUploadFile) {
                    // backup assetId so it can be easily be found during restore state step
                    (<NewEntryRelatedFile>relevantUploadFile.data).assetId = response.result.id;
                  }
                }
              });

            request.requests.push(setContentRequest);

          });
          changes.forEachRemovedItem((record: IterableChangeRecord<RelatedFile>) => {
            // remove deleted assets
            const deleteAssetRequest = new AttachmentAssetDeleteAction({ attachmentAssetId: (record.item as RelatedFile).id });
            const asset = record.item as RelatedFile;
            const relevantUploadFile = this._uploadManagement.getTrackedFile(asset.uploadFileId);

            if (relevantUploadFile) {
              deleteAssetRequest.setCompletion(response => {
                if (!response.error) {
                  this._uploadManagement.cancelUpload(asset.uploadFileId, true);
                }
              })
            }

            request.requests.push(deleteAssetRequest);
          });
        }
      }

      // update changed assets
      this._relatedFiles.getValue().items.forEach((asset: RelatedFile) => {
        const relatedFileDiffer = this.relatedFileDiffer[asset.id];
        if (relatedFileDiffer && relatedFileDiffer.diff(asset)) {
          const updateAssetRequest = new AttachmentAssetUpdateAction({ id: asset.id, attachmentAsset: asset });
          request.requests.push(updateAssetRequest);
        }
      });
    }
  }

  private _updateAssetsResponse(response: VidiunAttachmentAssetListResponse): void {
    response.objects.forEach((asset: RelatedFile) => {
      if (!asset.format && asset.fileExt) {
        asset.format = this._getFormatByExtension(asset.fileExt);
      }

      const relevantFile = this._uploadManagement.getTrackedFiles().find(file =>
        file.data instanceof NewEntryRelatedFile && file.data.assetId === asset.id
      );

      if (relevantFile) {
        asset.uploadFileId = relevantFile.id;
        asset.progress = (relevantFile.progress * 100).toFixed(0);
        asset.uploading = relevantFile.progress < 1;
        asset.uploadFailure = !!relevantFile.failureReason;
        asset.serverUploadToken = (<NewEntryRelatedFile>relevantFile.data).serverUploadToken;
      }
    });
  }

  private _syncBusyState(): void {
    // find intersection of tracked files and related files to avoid checking serverUploadToken on already uploaded assets
    const relevantFiles = this._relatedFiles.getValue().items
      .filter(({ uploadFileId }) => !!this._uploadManagement.getTrackedFile(uploadFileId));
    const isBusy = relevantFiles.some(file => !file.serverUploadToken);
    this.updateState({ isBusy });
  }

	private _addFile(fileName : string, format :VidiunAttachmentType) : VidiunAttachmentAsset {
    	const existingItems = this._relatedFiles.getValue().items;

		const newFile = new VidiunAttachmentAsset({
			filename: fileName,
			format: format
		});

		const files = [
			...existingItems,
			newFile
		];

		this._relatedFiles.next({items: files});

    this.updateState({ isBusy: true });
		this._setDirty();

		return newFile;
	}

  private _validateFileSize(file: File): boolean {
    const maxFileSize = globalConfig.vidiunServer.maxUploadFileSize;
    const fileSize = file.size / 1024 / 1024; // convert to Mb

    return this._uploadManagement.supportChunkUpload(new NewEntryRelatedFile(null)) || fileSize < maxFileSize;
  }

  public _removeFile(file: RelatedFile): void {
    // update the list by filtering the assets array.
    this._relatedFiles.next({ items: this._relatedFiles.getValue().items.filter((item: RelatedFile) => item !== file) });

    // stop tracking changes on this asset
    // if file id is empty it was added by the user so no need to track its changes.
    if (file.id && this.relatedFileDiffer[file.id]) {
      delete this.relatedFileDiffer[file.id];
    }

    this._syncBusyState();
    this._setDirty();
  }

	private _openFile(fileId: string, operation: string): void {
        let url = getVidiunServerUri("/api_v3/service/attachment_attachmentasset/action/serve/vs/" + this._appAuthentication.appUser.vs + "/attachmentAssetId/" + fileId);
		this._browserService.openLink(url);
	}

	public downloadFile(file: RelatedFile): void{
		this._openFile(file.id, 'download');
	}

	public previewFile(file : RelatedFile): void{
		this._openFile(file.id, 'url');
	}


  public _onFileSelected(selectedFiles: FileList) {
    if (selectedFiles && selectedFiles.length) {
      const files = Array.from(selectedFiles);
      const invalidFiles = files.filter(file => !this._validateFileSize(file));

      if (invalidFiles.length) {
        return this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
          message: `
            ${this._appLocalization.get('applications.upload.validation.fileSizeExceededFor')}
            ${invalidFiles.map(({ name }) => name).join('\n')}
          `
        });
      }

      const entryRelatedFiles = files.map(file => new NewEntryRelatedFile(file));
      this._uploadManagement.addFiles(entryRelatedFiles).forEach(addedFile => {
        const originalFileName = addedFile.data.getFileName();
        const hasExtension = originalFileName.indexOf('.') !== -1;
        const extension = hasExtension ? originalFileName.substr(originalFileName.lastIndexOf('.') + 1) : null;
        const newFile: RelatedFile = this._addFile(originalFileName, this._getFormatByExtension(extension));
        newFile.uploadFileId = addedFile.id;
        newFile.uploading = true;
        (<any>newFile).size = addedFile.data.getFileSize(); // we set type explicitly since size is readonly because it readonly

        return newFile;
      });
    }
  }

  public _cancelUpload(file: RelatedFile): void {
    if (!file.id) {
      this._uploadManagement.cancelUpload(file.uploadFileId, true);
    } else {
      this._removeFile(file);
    }
  }

  private _getFormatByExtension(ext: string): VidiunAttachmentType {
    let format: VidiunAttachmentType = null;
    ext = typeof ext === 'string' ? ext.toLowerCase() : ext;
    switch (ext) {
      case 'doc':
      case 'docx':
      case 'dot':
      case 'pdf':
      case 'ppt':
      case 'pps':
      case 'xls':
      case 'xlsx':
      case 'xml':
        format = VidiunAttachmentType.document;
        break;
      case 'gif':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'mp3':
      case 'mp4':
        format = VidiunAttachmentType.media;
        break;
      case 'txt':
        format = VidiunAttachmentType.text;
        break;
      case 'json':
        format = VidiunAttachmentType.json;
        break;
      default:
        break;
    }

    return format;
  }

	public _setDirty(){
		super.updateState({isDirty: true});
	}

    ngOnDestroy()
    {

    }
}
