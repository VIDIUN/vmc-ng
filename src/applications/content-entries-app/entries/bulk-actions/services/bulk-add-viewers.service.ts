import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEntryUpdateAction, VidiunBaseEntry, VidiunClient, VidiunMediaEntry } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkAddViewersService extends BulkActionBaseService<string[]> {

    constructor(_vidiunServerClient: VidiunClient) {
        super(_vidiunServerClient);
    }

    public execute(selectedEntries: VidiunMediaEntry[], viewersIds: string[]): Observable<{}> {
        return Observable.create(observer => {

            const requests: BaseEntryUpdateAction[] = [];

            selectedEntries.forEach(entry => {
                const updatedEntry: VidiunBaseEntry = new VidiunBaseEntry();

                // update entry publishers. trim publishers due to legacy VMC bugs
                let entryViewers = [];
                if (entry.entitledUsersView && entry.entitledUsersView.length) {
                    entryViewers = entry.entitledUsersView.split(',').map(publisher => publisher.trim());
                }
                // add selected publishers only if unique
                viewersIds.forEach(publisher => {
                    if (entryViewers.indexOf(publisher) === -1) {
                        entryViewers.push(publisher);
                    }
                });
                updatedEntry.entitledUsersView = entryViewers.join(',');
                requests.push(new BaseEntryUpdateAction({ entryId: entry.id, baseEntry: updatedEntry }));
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
