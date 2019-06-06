import { Injectable, OnDestroy } from '@angular/core';
import { VidiunClient } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { TrackedFileStatuses, UploadManagement } from '@vidiun-ng/vidiun-common';
import { NewEntryUploadFile } from './new-entry-upload-file';
import { MediaAddAction } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunUploadedFileTokenResource } from 'vidiun-ngx-client';
import { VidiunAssetParamsResourceContainer } from 'vidiun-ngx-client';
import { VidiunAssetsParamsResourceContainers } from 'vidiun-ngx-client';
import { MediaUpdateContentAction } from 'vidiun-ngx-client';
import { UploadTokenDeleteAction } from 'vidiun-ngx-client';
import { TrackedFileData } from '@vidiun-ng/vidiun-common';
import { Subject } from 'rxjs/Subject';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export interface VmcNewEntryUpload {
  file: File;
  mediaType: VidiunMediaType;
  entryName: string;
}

@Injectable()
export class NewEntryUploadService implements OnDestroy {
  public _mediaCreated = new Subject<{ id?: string, entryId?: string }>();
  public onMediaCreated$ = this._mediaCreated.asObservable();

  constructor(private _vidiunServerClient: VidiunClient,
              private _uploadManagement: UploadManagement) {
    this._monitorTrackedFilesChanges();
  }

  ngOnDestroy() {

  }

  private _monitorTrackedFilesChanges(): void {
    this._uploadManagement.onTrackedFileChanged$
      .pipe(cancelOnDestroy(this))
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .subscribe(
        trackedFile => {
          // NOTE: this service handles only 'purged' and 'waitingUpload' statuses by design.
          switch (trackedFile.status) {
            case TrackedFileStatuses.purged:
              this._cleanupUpload(trackedFile);
              break;
            case TrackedFileStatuses.prepared:
              this._linkEntryWithFile(trackedFile);
              break;
            default:
              break;
          }
        }
      );
  }

  private _cleanupUpload(trackedFile: TrackedFileData): void {
    const trackedFileData = <NewEntryUploadFile>trackedFile.data;

    if (trackedFileData.createMediaEntrySubscription instanceof Subscription) {
      trackedFileData.createMediaEntrySubscription.unsubscribe();
      trackedFileData.createMediaEntrySubscription = null;
    }

    if (trackedFileData.serverUploadToken) {
      this._removeUploadToken(trackedFileData.serverUploadToken)
        .subscribe(
          () => {
          },
          (error) => {
            console.warn(this._formatError('Failed to remove upload token', error));
          }
        );
    }
  }

  private _linkEntryWithFile(trackedFile: TrackedFileData): void {
    (<NewEntryUploadFile>trackedFile.data).createMediaEntrySubscription = this._createMediaEntry(<NewEntryUploadFile>trackedFile.data)
      .do(entry => {
        (<NewEntryUploadFile>trackedFile.data).entryId = entry.id;
        this._mediaCreated.next({ id: trackedFile.id, entryId: entry.id });
      })
      .switchMap((entry: VidiunMediaEntry) => this._updateMediaContent(entry, <NewEntryUploadFile>trackedFile.data))
      .subscribe(
        () => {
        },
        (error) => {
          this._uploadManagement.cancelUploadWithError(trackedFile.id, this._formatError('Failed to create entry', error));
        }
      );
  }

  private _updateMediaContent(entry: VidiunMediaEntry, file: NewEntryUploadFile): Observable<VidiunMediaEntry> {
    const entryId = entry.id;
    const conversionProfileId = file.transcodingProfileId;
    const subSubResource = new VidiunUploadedFileTokenResource({ token: file.serverUploadToken });
    let resource = null;

    if (file.mediaType === VidiunMediaType.image) {
      resource = subSubResource;
    } else {
      const subResource = new VidiunAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: 0 });
      resource = new VidiunAssetsParamsResourceContainers({ resources: [subResource] });
    }

    return this._vidiunServerClient.request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }));
  }

  private _createMediaEntry(file: NewEntryUploadFile): Observable<VidiunMediaEntry> {
    return this._vidiunServerClient.request(new MediaAddAction({
      entry: new VidiunMediaEntry({
        mediaType: file.mediaType,
        name: file.entryName,
        conversionProfileId: file.transcodingProfileId
      })
    }));
  }

  private _removeUploadToken(uploadTokenId: string): Observable<void> {
    return this._vidiunServerClient.request(new UploadTokenDeleteAction({ uploadTokenId }))
  }

  private _formatError(message: string, error: string | { message: string }): string {
    const errorMessage = typeof error === 'string' ? error : error && error.message ? error.message : 'unknown reason';
    return `${message}: ${errorMessage}`;
  }

  public upload(files: VmcNewEntryUpload[], trancodingProfileId: number): void {
    this._uploadManagement.addFiles(
      files.map(file => new NewEntryUploadFile(file.file, file.mediaType, trancodingProfileId, file.entryName))
    );
  }
}
