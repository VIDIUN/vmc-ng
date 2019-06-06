import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { BaseEntryDeleteAction } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

export class BulkDeleteError extends Error {
  type = 'bulkDelete';

  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class BulkDeleteService extends BulkActionBaseService<{}> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[]) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryDeleteAction[] = [];

      selectedEntries.forEach(entry => {
        requests.push(new BaseEntryDeleteAction({
          entryId: entry.id
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(new BulkDeleteError(error.message));
        }
      );
    });



  }

}
