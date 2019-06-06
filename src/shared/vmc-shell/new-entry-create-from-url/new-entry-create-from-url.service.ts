import { Injectable, OnDestroy } from '@angular/core';
import {
    VidiunAssetParamsResourceContainer,
    VidiunAssetsParamsResourceContainers,
    VidiunClient,
    VidiunMediaEntry,
    VidiunMediaType,
    VidiunMultiRequest,
    VidiunUrlResource,
    MediaAddAction,
    MediaUpdateContentAction,
} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { AppLocalization } from '@vidiun-ng/mc-shared';


export interface VmcNewEntryUpload {
    fileUrl: string;
    assetParamsId?: number;
}

@Injectable()
export class NewEntryCreateFromUrlService implements OnDestroy {
    constructor(private _vidiunServerClient: VidiunClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnDestroy() {

    }

    private _getMediaTypeFromExtension(extension: string): VidiunMediaType {

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
                return VidiunMediaType.video;
        }

    }

    private _getUpdateMediaContentAction(file: VmcNewEntryUpload): MediaUpdateContentAction {
        const resource = new VidiunUrlResource({ url: file.fileUrl });
        return new MediaUpdateContentAction({ entryId: '0', resource });
    }

    private _getMediaEntryAction(conversionProfileId: number, file: VmcNewEntryUpload): MediaAddAction {
        const url = file.fileUrl;
        const extension = url.substr(url.lastIndexOf(".")+1).toLowerCase();
        let name = url.substr(url.lastIndexOf("/")+1);
        name = name.lastIndexOf(".") !== -1 ? name.substr(0, name.lastIndexOf(".")) : name;
        return new MediaAddAction({
            entry: new VidiunMediaEntry({ conversionProfileId, name, mediaType: this._getMediaTypeFromExtension(extension) })
        });
    }

    public import(files: VmcNewEntryUpload[], transcodingProfileId: number): Observable<void> {
        const createMediaEntryActions = files.map((file) => this._getMediaEntryAction(transcodingProfileId, file));
        const updateMediaContentActions = files.map((file, index) =>
            this._getUpdateMediaContentAction(file).setDependency(['entryId', index, 'id'])
        );
        return this._vidiunServerClient.multiRequest(new VidiunMultiRequest(
            ...createMediaEntryActions,
            ...updateMediaContentActions
        )).map(responses => {
            if (responses.hasErrors()) {
                const message = responses.every(response => !!response.error)
                    ? this._appLocalization.get('applications.upload.uploadSettings.createFromUrlError.all')
                    : this._appLocalization.get('applications.upload.uploadSettings.createFromUrlError.some');
                throw Error(message);
            }
        });
    }
}
