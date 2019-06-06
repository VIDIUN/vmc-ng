import { Injectable } from '@angular/core';
import { UploadFileAdapter, UploadFileData } from '@vidiun-ng/vidiun-common';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';
import { VidiunClient } from 'vidiun-ngx-client';
import { UploadTokenAddAction } from 'vidiun-ngx-client';
import { UploadTokenUploadAction } from 'vidiun-ngx-client';
import { VidiunUploadToken } from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VidiunUploadFile } from './vidiun-upload-file';
import { VidiunRequest } from 'vidiun-ngx-client';
import { UploadTokenListAction } from 'vidiun-ngx-client';
import { VidiunUploadTokenFilter } from 'vidiun-ngx-client';
import { VidiunUploadTokenListResponse } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Injectable()
export class VidiunUploadAdapter extends UploadFileAdapter<VidiunUploadFile> {
    constructor(private _serverClient: VidiunClient,
                private _logger: VidiunLogger) {
        super();
        this._logger = _logger.subLogger('VidiunUploadAdapter');
    }

    get label(): string {
        return 'Vidiun OVP server';
    }

    private _getUploadToken(uploadFile: VidiunUploadFile): Observable<string> {

        return this._serverClient.request(
            new UploadTokenAddAction({
                uploadToken: new VidiunUploadToken()
            })
        )
            .map(
                (response) => {
                    return response.id;
                }
            );
    }

    supportChunkUpload(): boolean{
        return new UploadTokenUploadAction({
            uploadTokenId : 'uploadTokenId',
            fileData : <File>({})
        }).supportChunkUpload();
    }

    prepare(files: { id: string, data: VidiunUploadFile }[]): Observable<{ id: string, status: boolean }[]> {
        const multiRequest: VidiunRequest<any>[] = [];

        files.forEach(file => {
            multiRequest.push(
                new UploadTokenAddAction({
                    uploadToken: new VidiunUploadToken()
                })
            );
        });
        return this._serverClient.multiRequest(multiRequest)
            .map(responses => {
                return files.map((file, index) => {
                    const response = responses[index];
                    let status = !!response.result;

                    if (response.result) {
                        file.data.serverUploadToken = response.result.id;
                        this._logger.debug(`updated server upload token to '${response.result.id}' for file '${file.id}'`);
                    } else {
                        this._logger.warn(`failed to prepare file '${file.id}`);
                    }

                    return {id: file.id, status};
                });
            });
    }

    canHandle(uploadFile: UploadFileData): boolean {
        return uploadFile instanceof VidiunUploadFile;
    }

    resume(id: string, fileData: VidiunUploadFile): Observable<{ id: string, progress?: number }> {
      if (!fileData || !(fileData instanceof VidiunUploadFile) || !fileData.serverUploadToken) {
        return Observable.throw('missing upload token');
      }
    }

    upload(id: string, fileData: VidiunUploadFile): Observable<{ id: string, progress?: number }> {
        return Observable.create((observer) => {
            if (fileData && fileData instanceof VidiunUploadFile) {
                this._logger.info(`starting upload for file '${id}'`);

                let requestSubscription = Observable.of(fileData.serverUploadToken)
                    .switchMap(serverUploadToken =>
                    {
                        if (!serverUploadToken)
                        {
                            // start from the beginning
                            return Observable.of(0);
                        }else
                        {
                            return this._serverClient.request(
                                new UploadTokenListAction({
                                    filter: new VidiunUploadTokenFilter({ idIn: fileData.serverUploadToken })
                                })
                            ).map((response: VidiunUploadTokenListResponse) => {
                                const uploadedFileSize = response && response.objects && response.objects.length > 0 ? response.objects[0].uploadedFileSize : null;

                                if (typeof uploadedFileSize === 'number') {
                                    this._logger.info(`file '${id}': got from server 'uploadedFileSize' value ${uploadedFileSize} for '${fileData.serverUploadToken}'. resume upload. `);
                                    return uploadedFileSize*1;
                                }else
                                {
                                    this._logger.info(`file '${id}': server resulted without information about previous uploads '${fileData.serverUploadToken}'. (re)start new upload.`);
                                    return 0;
                                }
                            }).catch(caught =>
                            {
                                this._logger.warn(`file '${id}': failed to get 'uploadedFileSize' for '${fileData.serverUploadToken}'. re-start new upload. error: ${caught.message}`);
                                return Observable.of(0);
                            });
                        }
                    })
                    .switchMap(uploadedFileSize =>
                    {
                        const payload = {
                            uploadTokenId: fileData.serverUploadToken,
                            fileData: fileData.file,
                            uploadedFileSize: uploadedFileSize
                        };

                        return this._serverClient.request(
                            new UploadTokenUploadAction(payload).setProgress(
                                (uploaded, total) => {
                                    const progress = total && total !== 0 ? uploaded / total : null;
                                    observer.next({id: id, progress});
                                }
                            )
                        )
                    })
                    .subscribe(
                        () => {
                            requestSubscription = null;
                            this._logger.info(`file upload completed for file with upload token '${id}'`);
                            observer._complete();
                        },
                        (error) => {
                            requestSubscription = null;
                            this._logger.warn(`file upload failed for file with upload token '${id}' (reason: ${error.message})`);
                            observer.error(error);
                        }
                    );

                return () => {
                    if (requestSubscription) {
                        this._logger.info(`cancelling upload file to the server with upload token '${id}'`);
                        requestSubscription.unsubscribe();
                        requestSubscription = null;
                    }
                };
            } else {
                observer.error(new Error('missing upload token and content'));
            }

        });
    }
}
