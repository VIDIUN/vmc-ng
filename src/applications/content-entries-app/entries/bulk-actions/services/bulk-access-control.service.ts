import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { BaseEntryUpdateAction } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { VidiunAccessControl } from 'vidiun-ngx-client';

@Injectable()
export class BulkAccessControlService extends BulkActionBaseService<VidiunAccessControl> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], profile : VidiunAccessControl) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();
        updatedEntry.accessControlId = profile.id;
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
