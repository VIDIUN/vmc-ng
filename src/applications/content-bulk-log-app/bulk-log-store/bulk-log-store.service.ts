import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { VidiunClient, VidiunMultiResponse } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunBulkUploadFilter } from 'vidiun-ngx-client';
import { VidiunBulkUpload } from 'vidiun-ngx-client';
import { BulkUploadAbortAction } from 'vidiun-ngx-client';
import { BulkListAction } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { DatesRangeAdapter, DatesRangeType } from '@vidiun-ng/mc-shared';
import { ListTypeAdapter } from '@vidiun-ng/mc-shared';
import { FiltersStoreBase, TypeAdaptersMapping } from '@vidiun-ng/mc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunSearchOperator } from 'vidiun-ngx-client';
import { VidiunSearchOperatorType } from 'vidiun-ngx-client';
import { VidiunBaseEntryListResponse } from 'vidiun-ngx-client';
import { VidiunUtils } from '@vidiun-ng/vidiun-common';
import { NumberTypeAdapter } from '@vidiun-ng/mc-shared';
import { ContentBulkUploadsMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

const localStoragePageSizeKey = 'bulklog.list.pageSize';

export interface BulkLogFilters {
    pageSize: number,
    pageIndex: number,
    createdAt: DatesRangeType,
    uploadedItem: string[],
    status: string[]
}

@Injectable()
export class BulkLogStoreService extends FiltersStoreBase<BulkLogFilters> implements OnDestroy {
  private _bulkLog = {
    data: new BehaviorSubject<{ items: VidiunBulkUpload[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };

  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly bulkLog =
    {
      data$: this._bulkLog.data.asObservable(),
      state$: this._bulkLog.state.asObservable(),
      data: () => {
        return this._bulkLog.data.getValue().items;
      }
    };


  constructor(private _vidiunServerClient: VidiunClient,
              private _browserService: BrowserService,
              contentBulkUploadsMainView: ContentBulkUploadsMainViewService,
              _logger: VidiunLogger) {
    super(_logger.subLogger('BulkLogStoreService'));
    if (contentBulkUploadsMainView.isAvailable()) {
        this._prepare();
    }
  }

  ngOnDestroy() {
    this._bulkLog.data.complete();
    this._bulkLog.state.complete();
  }

  private _prepare(): void {

      // NOTICE: do not execute here any logic that should run only once.
      // this function will re-run if preparation failed. execute your logic
      // only after the line where we set isReady to true

    if (!this._isReady) {
      this._logger.info(`initiate service`);
      this._isReady = true;

      const defaultPageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey);
        if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
            this.filter({
                pageSize: defaultPageSize
            });
        }

      this._registerToFilterStoreDataChanges();
      this._executeQuery();
    }
  }

    protected _preFilter(updates: Partial<BulkLogFilters>): Partial<BulkLogFilters> {
        if (typeof updates.pageIndex === 'undefined') {
            // reset page index to first page everytime filtering the list by any filter that is not page index
            updates.pageIndex = 0;
        }

        return updates;
    }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(() => {
        this._executeQuery();
      });
  }

  private _executeQuery(): void {

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this._browserService.setInLocalStorage(localStoragePageSizeKey, pageSize);
    }

    this._logger.info(`handle loading of bulk-log data`);
    this._bulkLog.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._logger.info(`handle successful loading of bulk-log data`);
          this._querySubscription = null;

          this._bulkLog.state.next({ loading: false, errorMessage: null });

          this._bulkLog.data.next({
            items: <any[]>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._logger.warn(`handle failed loading of bulk-log data, show alert`, { errorMessage: error.message });
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._bulkLog.state.next({ loading: false, errorMessage });
        });


  }

  private _buildQueryRequest(): Observable<VidiunBaseEntryListResponse> {
    try {

      // create request items
      const filter = new VidiunBulkUploadFilter({});
      let responseProfile: VidiunDetachedResponseProfile = null;
      let pagination: VidiunFilterPager = null;

      const data: BulkLogFilters = this._getFiltersAsReadonly();

      // filter 'createdAt'
      if (data.createdAt) {
        if (data.createdAt.fromDate) {
          filter.uploadedOnGreaterThanOrEqual = VidiunUtils.getStartDateValue(data.createdAt.fromDate);
        }

        if (data.createdAt.toDate) {
          filter.uploadedOnLessThanOrEqual = VidiunUtils.getEndDateValue(data.createdAt.toDate);
        }
      }

      // filters of joined list
      this._updateFilterWithJoinedList(data.uploadedItem, filter, 'bulkUploadObjectTypeIn');
      this._updateFilterWithJoinedList(data.status, filter, 'statusIn');

      responseProfile = new VidiunDetachedResponseProfile({
        type: VidiunResponseProfileType.includeFields,
        fields: 'id,fileName,bulkUploadType,bulkUploadObjectType,uploadedBy,uploadedByUserId,uploadedOn,numOfObjects,status,error'
      });

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pagination = new VidiunFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // build the request
      return <any>this._vidiunServerClient.request(
        new BulkListAction({
          bulkUploadFilter: filter,
          pager: pagination,
        }).setRequestOptions({
            responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }

  }

  private _updateFilterWithJoinedList(list: string[], requestFilter: VidiunBulkUploadFilter, requestFilterProperty: keyof VidiunBulkUploadFilter): void {
    const value = (list || []).map(item => item).join(',');

    if (value) {
      requestFilter[requestFilterProperty] = value;
    }
  }

  protected _createDefaultFiltersValue(): BulkLogFilters {
    return {
      pageSize: 50,
      pageIndex: 0,
      createdAt: { fromDate: null, toDate: null },
        uploadedItem: [],
      status: []
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<BulkLogFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
        uploadedItem: new ListTypeAdapter<string>(),
      status: new ListTypeAdapter<string>()
    };
  }

  public reload(): void {
    this._logger.info(`reload bulk-log list data`);
    if (this._bulkLog.state.getValue().loading) {
      this._logger.info(`reloading in progress, skip duplicating request`);
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deleteBulkLog(id: number): Observable<VidiunBulkUpload> {
    return this._vidiunServerClient
      .request(new BulkUploadAbortAction({ id }));
  }

  public deleteBulkLogs(files: Array<VidiunBulkUpload>): Observable<VidiunMultiResponse> {
    return this._vidiunServerClient.multiRequest(files.map(({ id }) => new BulkUploadAbortAction({ id })));
  }
}

