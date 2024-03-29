import { Injectable, OnDestroy } from '@angular/core';
import { VidiunClient } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { VmcServerPolls } from 'app-shared/vmc-shared/server-polls';
import { BrowserService } from 'app-shared/vmc-shell';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UploadMonitorStatuses } from './upload-monitor.component';
import { VidiunDropFolder } from 'vidiun-ngx-client';
import { VidiunDropFolderFilter } from 'vidiun-ngx-client';
import { VidiunDropFolderOrderBy } from 'vidiun-ngx-client';
import { VidiunDropFolderContentFileHandlerConfig } from 'vidiun-ngx-client';
import { VidiunDropFolderStatus } from 'vidiun-ngx-client';
import { DropFolderListAction } from 'vidiun-ngx-client';
import { VidiunDropFolderFileHandlerType } from 'vidiun-ngx-client';
import { VidiunDropFolderContentFileHandlerMatchPolicy } from 'vidiun-ngx-client';
import { DropFolderFileListAction } from 'vidiun-ngx-client';
import { VidiunDropFolderFileFilter } from 'vidiun-ngx-client';
import { VidiunDropFolderFileStatus } from 'vidiun-ngx-client';
import { VidiunDropFolderFileListResponse } from 'vidiun-ngx-client';
import { DropFoldersRequestFactory } from './drop-folders-request-factory';
import { VidiunDropFolderFile } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

interface DropFoldersUploadFile {
  status: VidiunDropFolderFileStatus;
  uploadedOn: Date;
  id: number;
}

interface TrackedDropFoldersUploadFile extends DropFoldersUploadFile {
  allowPurging: boolean;
}

@Injectable()
export class DropFoldersMonitorService implements OnDestroy {
  private _dropFolderFiles: { [key: string]: TrackedDropFoldersUploadFile } = {};
  private _initializeState: null | 'busy' | 'succeeded' | 'failed' = null;
  private _poolingState: null | 'running' = null;

  private _totals = {
    data: new BehaviorSubject<UploadMonitorStatuses>({ uploading: 0, queued: 0, completed: 0, errors: 0 }),
    state: new BehaviorSubject<{ loading: boolean, error: boolean, isErrorRecoverable?: boolean, notPermitted?: boolean }>({
      loading: false,
      error: false,
      isErrorRecoverable: false,
      notPermitted: false
    })
  };

  private _dropFolderChangesFactory = new DropFoldersRequestFactory();
  private _activeStatuses = [
    VidiunDropFolderFileStatus.uploading,
    VidiunDropFolderFileStatus.pending,
    VidiunDropFolderFileStatus.waiting,
    VidiunDropFolderFileStatus.uploading,
  ];

  public readonly totals = { data$: this._totals.data.asObservable(), state$: this._totals.state.asObservable() };

  constructor(private _vidiunClient: VidiunClient,
              private _vmcServerPolls: VmcServerPolls,
              private _browserService: BrowserService,
              private _logger: VidiunLogger) {
    this._initTracking();
  }

  private _trackNewFile(file: DropFoldersUploadFile) {
    this._logger.debug(`tracking new file with id: '${file.id}'`);
    if (this._dropFolderFiles[file.id]) {
      this._logger.warn(`cannot track new file with id: '${file.id}'. a file with such id already exists`);
    } else {
      this._dropFolderFiles[file.id] = { id: file.id, status: file.status, uploadedOn: file.uploadedOn, allowPurging: false };
    }
  }

  private _getTrackedFiles(): TrackedDropFoldersUploadFile[] {
    return Object.keys(this._dropFolderFiles).map(key => this._dropFolderFiles[key]);
  }

  ngOnDestroy() {
    this._logger.debug('ngOnDestroy()');
    this._totals.data.complete();
    this._totals.state.complete();
  }

  private _calculateTotalsFromState(): UploadMonitorStatuses {

    if (this._initializeState !== 'succeeded') {
      return { uploading: 0, queued: 0, completed: 0, errors: 0 };
    } else {
      return this._getTrackedFiles().reduce((totals, upload) => {
        switch (upload.status) {
          case VidiunDropFolderFileStatus.pending:
          case VidiunDropFolderFileStatus.waiting:
          case VidiunDropFolderFileStatus.parsed:
          case VidiunDropFolderFileStatus.noMatch:
            totals.queued += 1;
            break;
          case VidiunDropFolderFileStatus.uploading:
          case VidiunDropFolderFileStatus.processing:
          case VidiunDropFolderFileStatus.downloading:
            totals.uploading += 1;
            break;
          case VidiunDropFolderFileStatus.handled:
            totals.completed += 1;
            break;
          case VidiunDropFolderFileStatus.errorHandling:
          case VidiunDropFolderFileStatus.errorDownloading:
          case VidiunDropFolderFileStatus.errorDeleting:
            totals.errors += 1;
            break;
          default:
            break;
        }

        return totals;
      }, { uploading: 0, queued: 0, completed: 0, errors: 0 });
    }
  }

  private _getDropFolders(): Observable<VidiunDropFolder[]> {
    const dropFolders = new DropFolderListAction({
      filter: new VidiunDropFolderFilter({
        orderBy: VidiunDropFolderOrderBy.createdAtDesc.toString(),
        statusEqual: VidiunDropFolderStatus.enabled
      }),
    }).setRequestOptions({
        acceptedTypes: [VidiunDropFolder, VidiunDropFolderContentFileHandlerConfig]
    });

    return this._vidiunClient.request(dropFolders)
      .map(response => {
        if (response && response.objects) {
          return response.objects.reduce((list, object) => {
            if (object instanceof VidiunDropFolder) {
              if (object.fileHandlerType === VidiunDropFolderFileHandlerType.content) {
                const cfg = object.fileHandlerConfig as VidiunDropFolderContentFileHandlerConfig;
                if (cfg.contentMatchPolicy === VidiunDropFolderContentFileHandlerMatchPolicy.addAsNew) {
                  list.push(object);
                } else if (cfg.contentMatchPolicy === VidiunDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
                  list.push(object);
                } else if (cfg.contentMatchPolicy === VidiunDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
                  list.push(object);
                }
              } else if (object.fileHandlerType === VidiunDropFolderFileHandlerType.xml) {
                list.push(object);
              }

              return list;
            } else {
              throw new Error(`invalid type provided, expected VidiunDropFolder, got ${typeof object}`);
            }
          }, []);
        }

        return [];
      });
  }

  private _getActiveUpload(dropFoldersIn: string): Observable<VidiunDropFolderFileListResponse> {
    const activeUploads = new DropFolderFileListAction({
      filter: new VidiunDropFolderFileFilter({
        dropFolderIdIn: dropFoldersIn,
        statusIn: this._activeStatuses.join(',')
      })
    });
    return this._vidiunClient.request(activeUploads)
  }

  private _cleanDeletedUploads(uploads: VidiunDropFolderFile[]): void {
    const uploadIds = uploads.map(({ id }) => id);
    this._getTrackedFiles().forEach(file => {
      const trackedUploadIsNotInResponse = uploadIds.indexOf(Number(file.id)) === -1;
      if (file.allowPurging && trackedUploadIsNotInResponse) {
        this._logger.info(`server poll returned without upload with id '${file.id}'. removing file from tracking list`);
        delete this._dropFolderFiles[file.id];
      }
    })
  }

  private _initTracking(): void {
    if (this._initializeState === 'failed' || this._initializeState === null) {
      this._logger.info(`getting active uploads status from server`);
      this._initializeState = 'busy';
      this._totals.state.next({ loading: true, error: false });

      this._getDropFolders()
        .map(dropFoldersList => {
          if (dropFoldersList.length) {
            return dropFoldersList.reduce((ids, vdf) => `${ids}${vdf.id},`, '');
          }

          throw new Error('notPermitted');
        })
        .do(dropFoldersIn => this._dropFolderChangesFactory.dropFolderIdIn = dropFoldersIn)
        .switchMap(dropFoldersIn => this._getActiveUpload(dropFoldersIn))
        .subscribe(
          response => {
            response.objects.forEach(upload => {
              this._trackNewFile({
                id: upload.id,
                status: upload.status,
                uploadedOn: upload.createdAt
              });
            });
            this._totals.state.next({ loading: false, error: false });
            this._initializeState = 'succeeded';

            this._updateServerQueryUploadedOnFilter();
            this._startPolling();
          },
          (error) => {
            const notPermitted = error && error.message === 'notPermitted';
            const isErrorRecoverable = !notPermitted;
            this._totals.state.next({
              loading: false,
              error: true,
              isErrorRecoverable,
              notPermitted
            });
            this._initializeState = 'failed';
          }
        );
    } else {
      this._logger.info(`everything is operating normally, no need to re-initialize`);
    }
  }

  private _updateServerQueryUploadedOnFilter(): void {
    const oldestUploadedOnFile = this._getTrackedFiles().reduce((acc, item) => !acc || item.uploadedOn < acc.uploadedOn ? item : acc, null);
    const uploadedOnFrom = oldestUploadedOnFile ? oldestUploadedOnFile.uploadedOn : this._browserService.sessionStartedAt;
    if (this._dropFolderChangesFactory.uploadedOn !== uploadedOnFrom) {
      this._logger.debug(`updating poll server query request with uploadedOn from ${uploadedOnFrom && uploadedOnFrom.toString()}`);
      this._dropFolderChangesFactory.uploadedOn = uploadedOnFrom;
    }
  }

  private _startPolling(): void {
    if (this._poolingState !== 'running') {
      this._poolingState = 'running';
      this._logger.info(`start server polling every 10 seconds to sync drop folders upload status`);


      this._vmcServerPolls.register<VidiunDropFolderFileListResponse>(10, this._dropFolderChangesFactory)
        .pipe(cancelOnDestroy(this))
        .subscribe((response) => {
          if (response.error) {
            this._logger.warn(`error occurred while trying to sync drop folders upload status from server. server error: ${response.error.message}`);
            this._totals.state.next({ loading: false, error: true, isErrorRecoverable: false });
            return;
          }

          const serverFiles = response.result.objects;

          if (serverFiles.length > 0) {
            this._cleanDeletedUploads(serverFiles);
            this._updateTrackedFilesFromServer(serverFiles);
            this._updateServerQueryUploadedOnFilter();
            this._updateAllowPurgingMode();
            this._totals.data.next(this._calculateTotalsFromState());
          } else {
            this._cleanDeletedUploads(serverFiles);
            this._updateAllowPurgingMode();
            this._totals.data.next(this._calculateTotalsFromState());
          }

          if (this._totals.state.getValue().error) {
            this._totals.state.next({ loading: false, error: false });
          }
        });
    }
  }

  private _updateAllowPurgingMode(): void {
    this._getTrackedFiles().filter(item => !item.allowPurging).forEach(file => {
      this._logger.debug(`update file '${file.id} to allow purging next time syncing from the server`);
      file.allowPurging = true;
    });
  }

  private _updateTrackedFilesFromServer(serverFiles: VidiunDropFolderFile[]): void {
    serverFiles.forEach(upload => {
      const currentUploadIsActive = this._activeStatuses.indexOf(upload.status) !== -1;
      const relevantUpload = this._dropFolderFiles[upload.id];

      if (relevantUpload) { // update status for existing upload
        if (relevantUpload.status !== upload.status) {
          this._logger.info(`sync upload file '${upload.id} with status '${upload.status}'`);
          relevantUpload.status = upload.status;
        }
      } else if (currentUploadIsActive) { // track new active upload
        this._trackNewFile({
          id: upload.id,
          status: upload.status,
          uploadedOn: upload.createdAt
        });
      }
    });

  }

  public retryTracking(): void {
    this._logger.debug(`retryTracking()`);

    this._initTracking();
  }
}
