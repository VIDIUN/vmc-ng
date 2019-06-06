import { Observable } from 'rxjs';
import { subApplicationsConfig } from 'config/sub-applications';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunRequest, VidiunMultiRequest, VidiunMultiResponse } from 'vidiun-ngx-client';


export abstract class BulkActionBaseService<T> {

  constructor(public _vidiunServerClient: VidiunClient) {
  }

  public abstract execute(selectedEntries: VidiunMediaEntry[] , params : T) : Observable<any>;

  transmit(requests : VidiunRequest<any>[], chunk : boolean) : Observable<{}>
  {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk){
      maxRequestsPerMultiRequest = subApplicationsConfig.shared.bulkActionsLimit;
    }

    let multiRequests: Observable<VidiunMultiResponse>[] = [];
    let mr :VidiunMultiRequest = new VidiunMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++){
      if (counter === maxRequestsPerMultiRequest){
        multiRequests.push(this._vidiunServerClient.multiRequest(mr));
        mr = new VidiunMultiRequest();
        counter = 0;
      }
      mr.requests.push(requests[i]);
      counter++;
    }
    multiRequests.push(this._vidiunServerClient.multiRequest(mr));

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
