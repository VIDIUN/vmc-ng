import {  Injectable } from '@angular/core';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { WidgetsManagerBase } from '@vidiun-ng/vidiun-ui'
import { EntryStore } from './entry-store.service';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class EntryWidgetsManager extends WidgetsManagerBase<VidiunMediaEntry, VidiunMultiRequest>
{
    private _entryStore : EntryStore;

    constructor(logger: VidiunLogger)
    {
        super(logger.subLogger('EntryWidgetsManager'));
    }

    set entryStore(value : EntryStore)
    {
       this._entryStore = value;
    }

    public returnToEntries() : void{
        if (this._entryStore) {
            this._entryStore.returnToEntries();
        }
    }
}
