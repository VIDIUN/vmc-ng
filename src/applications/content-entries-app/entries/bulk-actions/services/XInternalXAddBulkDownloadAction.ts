import { VidiunRequest } from 'vidiun-ngx-client';
import { VidiunRequestArgs } from 'vidiun-ngx-client';
import { VidiunObjectMetadata } from 'vidiun-ngx-client';

export interface XInternalXAddBulkDownloadActionArgs  extends VidiunRequestArgs {
    entryIds : string;
	flavorParamsId? : string;
}

/**
* Creates new download job for multiple entry ids (comma separated), an email will
* be sent when the job is done   This sevice support the following entries:    -
* MediaEntry   - Video will be converted using the flavor params id   - Audio will
* be downloaded as MP3   - Image will be downloaded as Jpeg   - MixEntry will be
* flattened using the flavor params id   - Other entry types are not supported
* Returns the admin email that the email message will be sent to
**/
export class XInternalXAddBulkDownloadAction extends VidiunRequest<string> {

    entryIds : string;
	flavorParamsId : string;

    constructor(data : XInternalXAddBulkDownloadActionArgs)
    {
        super(data, {responseType : 's', responseSubType : '', responseConstructor : null });
    }

    protected _getMetadata() : VidiunObjectMetadata
    {
        const result = super._getMetadata();
        Object.assign(
            result.properties,
            {
                service : { type : 'c', default : 'xinternal' },
				action : { type : 'c', default : 'xAddBulkDownload' },
				entryIds : { type : 's' },
				flavorParamsId : { type : 's' }
            }
        );
        return result;
    }
}

