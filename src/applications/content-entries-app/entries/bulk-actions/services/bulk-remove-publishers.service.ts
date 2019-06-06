import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {VidiunClient} from 'vidiun-ngx-client';

import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunBaseEntry} from 'vidiun-ngx-client';
import {BaseEntryUpdateAction} from 'vidiun-ngx-client';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkRemovePublishersService extends BulkActionBaseService<string[]> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], publishers: string[]): Observable<{}> {
    return Observable.create(observer => {

      const requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        const updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();

        // update entry publishers. trim publishers due to legacy VMC bugs
        let entryPublishers = [];
        if (entry.entitledUsersPublish && entry.entitledUsersPublish.length) {
          entryPublishers = entry.entitledUsersPublish.split(',').map(publisher => {
            return publisher.trim();
          });
        }
        // remove selected publishers only if exist
        publishers.forEach(publisher => {
          const index = entryPublishers.indexOf(publisher.trim());
          if (index !== -1) {
            entryPublishers.splice(index, 1);
          }
        });
        updatedEntry.entitledUsersPublish = entryPublishers.toString();
        requests.push(new BaseEntryUpdateAction({
          entryId: entry.id,
          baseEntry: updatedEntry
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });

  }

}
