import { RequestFactory } from '@vidiun-ng/vidiun-common';
import { VidiunMultiRequest, VidiunMultiResponse, VidiunRequestOptions } from 'vidiun-ngx-client';
import { BaseEntryGetAction } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { FlavorAssetGetFlavorAssetsWithParamsAction } from 'vidiun-ngx-client';

export class FlavorsDataRequestFactory implements RequestFactory<VidiunMultiRequest, VidiunMultiResponse> {
    constructor(private _entryId: string) {

    }

    create(): VidiunMultiRequest {
        const getReplacementDataAction = new BaseEntryGetAction({ entryId: this._entryId })
            .setRequestOptions(
                new VidiunRequestOptions({
                    responseProfile: new VidiunDetachedResponseProfile({
                        type: VidiunResponseProfileType.includeFields,
                        fields: 'replacementStatus,replacingEntryId'
                    })
                })
            );
        const getCurrentEntryFlavorsDataAction = new FlavorAssetGetFlavorAssetsWithParamsAction({ entryId: this._entryId });

        return new VidiunMultiRequest(getReplacementDataAction, getCurrentEntryFlavorsDataAction);
    }
}
