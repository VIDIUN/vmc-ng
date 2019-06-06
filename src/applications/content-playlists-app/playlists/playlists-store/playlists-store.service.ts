import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { VidiunClient } from 'vidiun-ngx-client';
import { PlaylistListAction } from 'vidiun-ngx-client';
import { VidiunPlaylistFilter } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { PlaylistDeleteAction } from 'vidiun-ngx-client';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { DatesRangeAdapter, DatesRangeType } from '@vidiun-ng/mc-shared';
import { FiltersStoreBase, TypeAdaptersMapping } from '@vidiun-ng/mc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunSearchOperatorType } from 'vidiun-ngx-client';
import { VidiunSearchOperator } from 'vidiun-ngx-client';
import { StringTypeAdapter } from '@vidiun-ng/mc-shared';
import { NumberTypeAdapter } from '@vidiun-ng/mc-shared';
import { VidiunUtils } from '@vidiun-ng/vidiun-common';
import { ContentPlaylistsMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { globalConfig } from 'config/global';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunPlaylistListResponse } from 'vidiun-ngx-client';

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface PlaylistsFilters {
  pageSize: number,
  pageIndex: number,
  freeText: string,
  sortBy: string,
  sortDirection: number,
  createdAt: DatesRangeType
}

export interface ExtendedPlaylist extends VidiunPlaylist {
    tooltip?: string;
}

const localStoragePageSizeKey = 'playlists.list.pageSize';

@Injectable()
export class PlaylistsStore extends FiltersStoreBase<PlaylistsFilters> implements OnDestroy {
  private _playlists = {
    data: new BehaviorSubject<{ items: ExtendedPlaylist[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly playlists = {
    data$: this._playlists.data.asObservable(),
    state$: this._playlists.state.asObservable(),
    data: () => this._playlists.data.value
  };

  constructor(private _vidiunServerClient: VidiunClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              contentPlaylistsMainView: ContentPlaylistsMainViewService,
              _logger: VidiunLogger) {
        super(_logger);
        if (contentPlaylistsMainView.isAvailable()) {
            this._prepare();
        }
  }

  ngOnDestroy() {
    this._playlists.data.complete();
    this._playlists.state.complete();
  }

  private _prepare(): void {

      // NOTICE: do not execute here any logic that should run only once.
      // this function will re-run if preparation failed. execute your logic
      // only after the line where we set isReady to true

    if (!this._isReady) {
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

    this._playlists.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._querySubscription = null;

          this._playlists.state.next({ loading: false, errorMessage: null });

          this._playlists.data.next({
            items: this._extendPlaylistsWithTooltip(response.objects),
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._playlists.state.next({ loading: false, errorMessage });
        });
  }

  private _extendPlaylistsWithTooltip(playlists: ExtendedPlaylist[]): ExtendedPlaylist[] {
      playlists.forEach(playlist => {
          const tags = playlist.tags ? playlist.tags.split(',').filter(item => !!item).map(item => item.trim()).join('\n') : null;
          playlist.tooltip = tags
              ? this._appLocalization.get('applications.content.table.nameTooltip', [playlist.name, tags])
              : playlist.name;
      });
      return playlists;
  }
    private _buildQueryRequest(): Observable<VidiunPlaylistListResponse> {
    try {

      // create request items
      const filter = new VidiunPlaylistFilter({});
      let responseProfile: VidiunDetachedResponseProfile = null;
      let pager: VidiunFilterPager = null;

      const advancedSearch = filter.advancedSearch = new VidiunSearchOperator({});
      advancedSearch.type = VidiunSearchOperatorType.searchAnd;

      const data: PlaylistsFilters = this._getFiltersAsReadonly();

      // filter 'createdAt'
      if (data.createdAt) {
        if (data.createdAt.fromDate) {
          filter.createdAtGreaterThanOrEqual = VidiunUtils.getStartDateValue(data.createdAt.fromDate);
        }

        if (data.createdAt.toDate) {
          filter.createdAtLessThanOrEqual = VidiunUtils.getEndDateValue(data.createdAt.toDate);
        }
      }

      // update desired fields of entries
        responseProfile = new VidiunDetachedResponseProfile({
          type: VidiunResponseProfileType.includeFields,
          fields: 'id,name,createdAt,playlistType,status,tags'
        });

      // update the sort by args
      if (data.sortBy) {
        filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
      }

      // filter 'freeText'
      if (data.freeText) {
        filter.freeText = data.freeText;
      }

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new VidiunFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // build the request
      return this._vidiunServerClient.request(
        new PlaylistListAction({ filter, pager}).setRequestOptions({
            responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }
  }

    protected _preFiltersReset(updates: Partial<PlaylistsFilters>): Partial<PlaylistsFilters> {
        delete updates.sortBy;
        delete updates.sortDirection;
        return updates;
    }

    protected _preFilter(updates: Partial<PlaylistsFilters>): Partial<PlaylistsFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): PlaylistsFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      pageSize: pageSize,
      pageIndex: 0,
      freeText: '',
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      createdAt: { fromDate: null, toDate: null }
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<PlaylistsFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      freeText: new StringTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
    };
  }

  public reload(): void {
    if (this._playlists.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deletePlaylist(id: string): Observable<void> {
    return this._vidiunServerClient
      .request(new PlaylistDeleteAction({ id }))
      .map(() => {
      });
  }
}

