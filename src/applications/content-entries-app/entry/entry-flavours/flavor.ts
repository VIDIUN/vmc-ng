import { VidiunFlavorAssetWithParams } from 'vidiun-ngx-client';

export interface Flavor extends VidiunFlavorAssetWithParams{
    name: string,
    id: string,
    paramsId: number,
    isSource: boolean,
    isWeb: boolean,
    isWidevine: boolean,
    format: string,
    codec: string,
    bitrate: string,
    size: string,
    dimensions: string,
    status: string,
    statusLabel: string,
    statusTooltip: string,
    tags: string,
    drm: any,
    uploadFileId: string
}
