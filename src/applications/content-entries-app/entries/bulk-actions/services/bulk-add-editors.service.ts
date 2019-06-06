import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {VidiunClient} from 'vidiun-ngx-client';

import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunBaseEntry} from 'vidiun-ngx-client';
import {BaseEntryUpdateAction} from 'vidiun-ngx-client';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkAddEditorsService extends BulkActionBaseService<string[]> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedEntries: VidiunMediaEntry[], editorsIds: string[]): Observable<{}> {
    return Observable.create(observer => {

      const requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        const updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();

        // update entry editors. trim editors due to legacy VMC bugs
        let entryEditors = [];
        if (entry.entitledUsersEdit && entry.entitledUsersEdit.length) {
          entryEditors = entry.entitledUsersEdit.split(',').map(editor => {
            return editor.trim();
          });
        }
        // add selected editors only if unique
        editorsIds.forEach(editor => {
          if (entryEditors.indexOf(editor) === -1) {
            entryEditors.push(editor);
          }
        });
        updatedEntry.entitledUsersEdit = entryEditors.join(',');
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
