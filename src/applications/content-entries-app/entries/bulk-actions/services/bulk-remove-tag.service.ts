import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { BaseEntryUpdateAction } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkRemoveTagsService extends BulkActionBaseService<string[]> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], tags : string[]) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();

        // update entry tags. trim tags due to legacy VMC bugs
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
