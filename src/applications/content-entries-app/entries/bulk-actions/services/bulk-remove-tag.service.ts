import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaBaseEntry } from 'kaltura-typescript-client/types/KalturaBaseEntry';
import { BaseEntryUpdateAction } from 'kaltura-typescript-client/types/BaseEntryUpdateAction';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkRemoveTagsService extends BulkActionBaseService<string[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], tags : string[]) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

        // update entry tags. trim tags due to legacy KMC bugs
        let entryTags = [];
        if (entry.tags && entry.tags.length){
          entryTags = entry.tags.split(",").map(tag => {
            return tag.trim()
          });
        }
        // remove selected tags only if exist
        tags.forEach(tag => {
          const index = entryTags.indexOf(tag.trim())
          if (index !== -1){
            entryTags.splice(index,1);
          }
        });
        updatedEntry.tags = entryTags.toString();
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
