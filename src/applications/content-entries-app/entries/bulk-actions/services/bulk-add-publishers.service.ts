import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {KalturaClient} from 'kaltura-ngx-client';

import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {KalturaBaseEntry} from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import {BaseEntryUpdateAction} from 'kaltura-ngx-client/api/types/BaseEntryUpdateAction';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkAddPublishersService extends BulkActionBaseService<string[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], publishers: string[]): Observable<{}> {
    return Observable.create(observer => {

      const requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        const updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

        // update entry publishers. trim publishers due to legacy KMC bugs
        let entryPublishers = [];
        if (entry.entitledUsersPublish && entry.entitledUsersPublish.length) {
          entryPublishers = entry.entitledUsersPublish.split(',').map(publisher => {
            return publisher.trim();
          });
        }
        // add selected publishers only if unique
        publishers.forEach(publisher => {
          if (entryPublishers.indexOf(publisher) === -1) {
            entryPublishers.push(publisher);
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
