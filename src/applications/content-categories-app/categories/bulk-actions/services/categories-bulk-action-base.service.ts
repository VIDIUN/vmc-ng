import { Observable } from 'rxjs';
import { subApplicationsConfig } from 'config/sub-applications';
import { VidiunClient, VidiunCategory, VidiunRequest, VidiunMultiRequest, VidiunMultiResponse } from 'vidiun-ngx-client';

export abstract class CategoriesBulkActionBaseService<T> {
  constructor(public _vidiunServerClient: VidiunClient) {
  }

  public abstract execute(selectedCategories: VidiunCategory[], params: T): Observable<any>;

  transmit(requests: VidiunRequest<any>[], chunk: boolean): Observable<void> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = subApplicationsConfig.shared.bulkActionsLimit;
    }

    const multiRequests: Observable<VidiunMultiResponse>[] = [];
    let mr: VidiunMultiRequest = new VidiunMultiRequest();

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
          const mergedResponses = [].concat.apply([], responses);
          const errorMessage = mergedResponses.reduce((acc, val) => `${acc}${val.error ? val.error.message : ''}\n`, '').trim();
          if (errorMessage) {
              throw new Error(errorMessage);
          }
      });
  }
}
