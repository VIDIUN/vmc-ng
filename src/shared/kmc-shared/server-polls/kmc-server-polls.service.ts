import {
    VidiunAPIException, VidiunClient, VidiunMultiRequest, VidiunRequest, VidiunRequestBase
} from 'vidiun-ngx-client';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError as ObservableThrowError} from 'rxjs';
import { ServerPolls } from '@vidiun-ng/vidiun-common';
import { Subject } from 'rxjs/Subject';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { AppEventsService } from 'app-shared/vmc-shared/app-events';
import { UserLoginStatusEvent } from 'app-shared/vmc-shared/events';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class VmcServerPolls extends ServerPolls<VidiunRequestBase, VidiunAPIException> implements OnDestroy {
  private _onDestory = new Subject<void>();
  private _isLogged = false;
  private _isVSValid = true;
  protected _getOnDestroy$(): Observable<void> {
      return this._onDestory.asObservable();
  }

  constructor(private _vidiunClient: VidiunClient, private _vidiunLogger: VidiunLogger, private _appEvents: AppEventsService) {
      super(null); // _vidiunLogger.subLogger('VmcServerPolls')

      _appEvents.event(UserLoginStatusEvent).subscribe(
          event => {
              this._isLogged = event.isLogged;
              if (this._isLogged) {
                  this._isVSValid = true;
              }
          }
      );
  }

  protected _createGlobalError(error?: Error): VidiunAPIException {
      return new VidiunAPIException( error ? error.message : '', 'vmc-server_polls_global_error', null);
  }

  protected _canExecute(): boolean {
    return this._isLogged && this._isVSValid;
  }

  /*
   *   Before execution of the request function will flatten request array
   *   to perform correct multi-request and aggregate responses to according requests
   *   Example:
   *   input: [a,b, [c1,c2,c3], [d1,d2], e] - where a,b,e - requests, c and d - multi-requests
   *   actual: [a, b, c1, c2, c3, d1, d2, e] - flattened array before execution
   *   [1,1,3,2,1] - mapping by count of requests in multi-requests, needed to restore original structure of requests
   *   response: [a,b, [c1,c2,c3], [d1,d2],e] - response mapped to according requests
   */
  protected _executeRequests(requests: VidiunRequestBase[]): Observable<{ error: VidiunAPIException, result: any }[]> {
    const multiRequest = new VidiunMultiRequest();
    const requestsMapping: number[] = [];
    requests.forEach(request => {
      if (request instanceof VidiunRequest) {
        multiRequest.requests.push(request);
        requestsMapping.push(1);
      } else if (request instanceof VidiunMultiRequest) {
        multiRequest.requests.push(...request.requests);
        requestsMapping.push(request.requests.length);
      } else {
        throw new Error(`unsupported type of request provided '${typeof request}'`);
      }
    });
      return this._vidiunClient.multiRequest(multiRequest.setNetworkTag('pr'))
          .pipe(
              map(responses => {
                  if (responses.hasErrors()) {
                      throw responses.getFirstError();
                  }

                  return requestsMapping.reduce((aggregatedResponses, requestSize) => {
                      const response = responses.splice(0, requestSize);
                      const unwrappedResponse = response.length === 1 ? response[0] : response;
                      return [...aggregatedResponses, unwrappedResponse];
                  }, []);
              }),
              catchError(error => {
                  if (error.code === 'INVALID_VS') {
                      this._isVSValid = false;
                  }
                  return ObservableThrowError(error);
              }),
          );
  }

  ngOnDestroy(): void {
    this._onDestory.next();
    this._onDestory.complete();
  }
}
