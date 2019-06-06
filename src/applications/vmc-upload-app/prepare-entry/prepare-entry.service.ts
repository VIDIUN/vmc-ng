import {Injectable} from '@angular/core';
import {VidiunClient} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {MediaAddAction} from 'vidiun-ngx-client';
import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunMediaType} from 'vidiun-ngx-client';
import {AppLocalization} from '@vidiun-ng/mc-shared';


export interface DraftEntry {
  id: string;
}

@Injectable()
export class PrepareEntryService {

  constructor(private _vidiunServerClient: VidiunClient,
              private _appLocalization: AppLocalization) {
  }

  public createDraftEntry(mediaType: VidiunMediaType, conversionProfileId?: number): Observable<DraftEntry> {

    const entry: VidiunMediaEntry = new VidiunMediaEntry({
      name: this._appLocalization.get('applications.upload.uploadMenu.createDraft.draftEntry'),
      mediaType
    });

    if (conversionProfileId) {
      entry.conversionProfileId = conversionProfileId;
    }

    return this._vidiunServerClient
      .request(new MediaAddAction({entry}))
      .map(media => ({id: media.id}))
      .catch(error => {
        // re-throw the provided error
        return Observable.throw(new Error('Unable to create draft entry'));
      });
  }
}
