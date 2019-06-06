import { Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { MetadataProfileStore } from 'app-shared/vmc-shared';
import { BaseEntryDeleteAction } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunClient } from 'vidiun-ngx-client';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import {
  DatesRangeAdapter,
  DatesRangeType,
  EnumTypeAdapter,
  FiltersStoreBase,
  GroupedListAdapter,
  GroupedListType,
  ListTypeAdapter,
  NumberTypeAdapter,
  StringTypeAdapter,
  TypeAdaptersMapping
} from '@vidiun-ng/mc-shared';
import { CategoriesModeAdapter, CategoriesModes, CategoriesModeType } from 'app-shared/content-shared/categories/categories-mode-type';
import { Subject } from 'rxjs/Subject';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { VidiunMediaEntryFilter } from 'vidiun-ngx-client';
import { globalConfig } from 'config/global';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface EntriesDataProvider {
  executeQuery(filters: EntriesFilters): Observable<{ entries: VidiunBaseEntry[], totalCount?: number }>;

  getDefaultFilterValues(savedAutoSelectChildren: CategoriesModes, pageSize: number): EntriesFilters;

  getServerFilter(filters: EntriesFilters, forRequest?: boolean): Observable<VidiunMediaEntryFilter>;
}

export interface MetadataProfileData {
  id: number;
  name: string;
  lists: { id: string, name: string }[];
}

export interface EntriesFilters {
  freetext: string;
  pageSize: number;
  pageIndex: number;
  sortBy: string;
  sortDirection: SortDirection;
  createdAt: DatesRangeType;
  scheduledAt: DatesRangeType;
  mediaTypes: string[];
  timeScheduling: string[];
  ingestionStatuses: string[];
  durations: string[];
  originalClippedEntries: string[];
  moderationStatuses: string[];
  replacementStatuses: string[];
  accessControlProfiles: string[];
  flavors: string[];
  distributions: string[];
  categories: number[];
  categoriesMode: CategoriesModeType;
  customMetadata: GroupedListType<string>;
  limits: number;
}

export const EntriesDataProviderToken = new InjectionToken('entries-data-provider');
export const EntriesManualExecutionModeToken = new InjectionToken<boolean>('entries-data-provider');
export const EntriesStorePaginationCacheToken = new InjectionToken('entries-store-pagination-cache-token');

@Injectable()
export class EntriesStore extends FiltersStoreBase<EntriesFilters> implements OnDestroy {
  private _entries = {
    data: new BehaviorSubject<{ items: VidiunMediaEntry[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };

  private _isReady = false;
  private _querySubscription: ISubscription;
  private _preFilterSubject = new Subject<Partial<EntriesFilters>>();
  public preFilter$ = this._preFilterSubject.asObservable();

  public readonly entries = {
    data$: this._entries.data.asObservable(),
    state$: this._entries.state.asObservable(),
    data: () => this._entries.data.getValue().items
  };

  constructor(private _vidiunServerClient: VidiunClient,
              private _browserService: BrowserService,
              private _metadataProfileService: MetadataProfileStore,
              @Inject(EntriesDataProviderToken) private _dataProvider: EntriesDataProvider,
              @Inject(EntriesStorePaginationCacheToken) @Optional() private _paginationCacheToken: string,
              @Inject(EntriesManualExecutionModeToken) @Optional() manualExecutionMode: boolean,
              _logger: VidiunLogger) {
    super(_logger);

    if (!this._paginationCacheToken) {
      this._paginationCacheToken = 'default';
    }

    if (!manualExecutionMode) {
        this._prepare();
    }
  }

  protected _preFiltersReset(updates: Partial<EntriesFilters>): Partial<EntriesFilters> {
    delete updates.sortBy;
    delete updates.sortDirection;
    return updates;
  }

  protected _preFilter(updates: Partial<EntriesFilters>): Partial<EntriesFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    if (typeof updates.categoriesMode !== 'undefined') {
      this._browserService.setInLocalStorage('contentShared.categoriesTree.selectionMode', updates.categoriesMode);
    }

    this._preFilterSubject.next(updates);

    return updates;
  }

  private _prepare(): void {
    // NOTICE: do not execute here any logic that should run only once.
    // this function will re-run if preparation failed. execute your logic
    // only after the line where we set isReady to true    if (!this._isReady) {
    this._entries.state.next({ loading: true, errorMessage: null });

    this._isReady = true;

    this._registerToFilterStoreDataChanges();

    this._executeQuery();
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(() => {
        this._executeQuery();
      });

  }

  private _getPaginationCacheKey(): string {
    return `entries.${this._paginationCacheToken}.list.pageSize`;
  }

  ngOnDestroy() {
    this._entries.state.complete();
    this._entries.data.complete();
  }

  public reload(): void {
    if (this._entries.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  private _executeQuery(): void {
    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this._browserService.setInLocalStorage(this._getPaginationCacheKey(), pageSize);
    }

    this._entries.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._dataProvider.executeQuery(this._getFiltersAsReadonly())
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._querySubscription = null;

          this._entries.state.next({ loading: false, errorMessage: null });

            response.entries.forEach(entry => {
                if ((entry.capabilities || '').indexOf('quiz.quiz') !== -1) {
                    entry['isQuizEntry'] = true;
                }
            });

          this._entries.data.next({
            items: <any[]>response.entries,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._entries.state.next({ loading: false, errorMessage });
        });
  }

  public deleteEntry(entryId: string): Observable<void> {


    if (!entryId || !entryId.length) {
      return Observable.throw(new Error('missing entryId argument'));
    }


    return this._vidiunServerClient
      .request(new BaseEntryDeleteAction({ entryId }))
      .map(() => {
        return;
      });
  }

  protected _createDefaultFiltersValue(): EntriesFilters {
    const savedAutoSelectChildren: CategoriesModes = this._browserService.getFromLocalStorage('contentShared.categoriesTree.selectionMode');
    const pageSize = this._browserService.getFromLocalStorage(this._getPaginationCacheKey()) || globalConfig.client.views.tables.defaultPageSize;
    return this._dataProvider.getDefaultFilterValues(savedAutoSelectChildren, pageSize);
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
    return {
      freetext: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new EnumTypeAdapter<SortDirection>(),
      createdAt: new DatesRangeAdapter(),
      scheduledAt: new DatesRangeAdapter(),
      mediaTypes: new ListTypeAdapter<string>(),
      timeScheduling: new ListTypeAdapter<string>(),
      ingestionStatuses: new ListTypeAdapter<string>(),
      durations: new ListTypeAdapter<string>(),
      originalClippedEntries: new ListTypeAdapter<string>(),
      moderationStatuses: new ListTypeAdapter<string>(),
      replacementStatuses: new ListTypeAdapter<string>(),
      accessControlProfiles: new ListTypeAdapter<string>(),
      flavors: new ListTypeAdapter<string>(),
      distributions: new ListTypeAdapter<string>(),
      categories: new ListTypeAdapter<number>(),
      categoriesMode: new CategoriesModeAdapter(),
      customMetadata: new GroupedListAdapter<string>(),
      limits: new NumberTypeAdapter()
    };
  }

  public convertFiltersToServerStruct(): Observable<VidiunMediaEntryFilter> {
    return this._dataProvider.getServerFilter(this._getFiltersAsReadonly(), false);
  }
}
