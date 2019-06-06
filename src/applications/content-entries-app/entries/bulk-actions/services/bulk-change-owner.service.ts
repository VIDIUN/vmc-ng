import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { BaseEntryUpdateAction } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { VidiunUser } from 'vidiun-ngx-client';

@Injectable()
export class BulkChangeOwnerService extends BulkActionBaseService<VidiunUser> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], owner : VidiunUser) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();
        updatedEntry.userId = owner.id;
        requests.push(new BaseEntryUpdateAction({
          entryId: entry.id,
          baseEntry: updatedEntry
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({})
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });



  }

}
