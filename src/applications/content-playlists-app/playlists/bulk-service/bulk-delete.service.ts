import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistsStore } from '../playlists-store/playlists-store.service';
import { PlaylistDeleteAction } from 'vidiun-ngx-client';
import { VidiunRequest } from 'vidiun-ngx-client';
import { subApplicationsConfig } from 'config/sub-applications';
import { VidiunClient } from 'vidiun-ngx-client';

@Injectable()
export class BulkDeleteService {
  constructor(public _playlistsStore: PlaylistsStore, public _vidiunServerClient: VidiunClient) {
  }

  public deletePlaylist(ids: string[]): Observable<{}> {
    if (!ids || ids.length <= 0) {
      return Observable.empty();
    }

    return this._transmit(ids.map(id => new PlaylistDeleteAction({ id })), true);
  }

  private _transmit(requests: VidiunRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = subApplicationsConfig.shared.bulkActionsLimit || requests.length;
    }

    // split request on chunks => [[], [], ...], each of inner arrays has length of maxRequestsPerMultiRequest
    const splittedRequests = [];
    let start = 0;
    while (start < requests.length) {
      const end = start + maxRequestsPerMultiRequest;
      splittedRequests.push(requests.slice(start, end));
      start = end;
    }
    const multiRequests = splittedRequests
      .map(reqChunk => this._vidiunServerClient.multiRequest(reqChunk));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const errorMessage = [].concat.apply([], responses)
          .filter(response => !!response.error)
          .reduce((acc, { error }) => `${acc}\n${error.message}`, '')
          .trim();

        if (!!errorMessage) {
          throw new Error(errorMessage);
        } else {
          return {};
        }
      });
  }
}
