import { BrowserService } from 'shared/vmc-shell/providers/browser.service';
import {
    VidiunClient,
    VidiunDetachedResponseProfile,
    VidiunDropFolderFileFilter,
    VidiunFilterPager,
    VidiunMultiRequest,
    VidiunMultiResponse,
    VidiunPartner,
    VidiunPartnerFilter,
    VidiunPartnerGroupType,
    VidiunPartnerStatus,
    VidiunResponseProfileType,
    VidiunSessionType, PartnerGetAction,
    PartnerGetInfoAction,
    PartnerListAction,
    PartnerRegisterAction,
    SessionImpersonateAction,
    VarConsoleUpdateStatusAction
} from 'vidiun-ngx-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization, FiltersStoreBase, ListTypeAdapter, NumberTypeAdapter, StringTypeAdapter, TypeAdaptersMapping } from '@vidiun-ng/mc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { globalConfig } from 'config/global';
import { AdminMultiAccountMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { AppAuthentication } from "app-shared/vmc-shell";

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface AccountFilters {
  freeText: string;
  pageSize: number;
  pageIndex: number;
  sortBy: string;
  sortDirection: number;
  status: string[];
}

const localStoragePageSizeKey = 'accounts.list.pageSize';

@Injectable()
export class MultiAccountStoreService extends FiltersStoreBase<AccountFilters> implements OnDestroy {


  private _accounts = {
    data: new BehaviorSubject<{ items: VidiunPartner[], totalCount: number, templateAccounts: VidiunPartner[], usedAccountsCount: number }>({ items: [], totalCount: 0, templateAccounts: [], usedAccountsCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;
    private _allStatusesList = [
        VidiunPartnerStatus.active,
        VidiunPartnerStatus.blocked,
        VidiunPartnerStatus.fullBlock
    ].join(',');

  public readonly accounts = { data$: this._accounts.data.asObservable(), state$: this._accounts.state.asObservable() };

  constructor(private _vidiunClient: VidiunClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication,
              adminMultiAccountMainViewService: AdminMultiAccountMainViewService,
              _logger: VidiunLogger) {
    super(_logger.subLogger('AccountsStoreService'));
    if (adminMultiAccountMainViewService.isAvailable()) {
        this._prepare();
    }
  }

  ngOnDestroy() {
    this._accounts.data.complete();
    this._accounts.state.complete();
  }

  protected _createDefaultFiltersValue(): AccountFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      freeText: '',
      pageSize: pageSize,
      pageIndex: 0,
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      status: [],
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<AccountFilters> {
    return {
      freeText: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      status: new ListTypeAdapter<string>()
    };
  }

  protected _preFilter(updates: Partial<AccountFilters>): Partial<AccountFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  private _prepare(): void {
    // NOTICE: do not execute here any logic that should run only once.
    // this function will re-run if preparation failed. execute your logic
    // only after the line where we set isReady to true    if (!this._isReady) {

      if (!this._isReady) {
          this._isReady = true;
          this._logger.info(`initiate service`);
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

    this._logger.info(`loading accounts list data`);
    this._accounts.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
          (responses: VidiunMultiResponse) => {
              if (responses.hasErrors()) {
                  this._querySubscription = null;
                  const error = responses.getFirstError();
                  const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                  this._logger.info(`handle failed loading accounts list data, show alert`, {errorMessage});
                  this._accounts.state.next({loading: false, errorMessage});
              } else {
                  this._logger.info(`handle success loading accounts list data`);
                  this._querySubscription = null;

                  this._accounts.state.next({loading: false, errorMessage: null});

                  this._accounts.data.next({
                      items: responses[0].result.objects,
                      totalCount: <number>responses[0].result.totalCount,
                      templateAccounts: responses[1].result.objects,
                      usedAccountsCount: <number>responses[2].result.totalCount
                  });
              }
          });
  }

  private _isNameExist(name: string): boolean {
    return this._accounts.data.value.items.find(item => item['name'] === name) !== undefined;
  }

    private _updateFilterWithJoinedList(list: string[], requestFilter: VidiunPartnerFilter, requestFilterProperty: keyof VidiunDropFolderFileFilter): void {
        const value = (list || []).map(item => item).join(',');

        if (value) {
            requestFilter[requestFilterProperty] = value;
        }
    }

  private _buildQueryRequest(): Observable<VidiunMultiResponse> {
    try {

      let pager: VidiunFilterPager = null;
      const filter = new VidiunPartnerFilter({});
      const data: AccountFilters = this._getFiltersAsReadonly();

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new VidiunFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

        // filter 'freeText'
        if (data.freeText) {
            if (/^-{0,1}\d+$/.test(data.freeText)){
                // number - search pid
                filter.idIn = data.freeText;
            } else {
                // string - search account name
                filter.nameMultiLikeOr = data.freeText;
            }

        }

        // filters of joined list
        this._updateFilterWithJoinedList(data.status, filter, 'statusIn');

        // handle default value for statuses
        if (!filter.statusIn) {
            filter.statusIn = this._allStatusesList;
        }


        // update the sort by args
        if (data.sortBy) {
            filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
        }

        // create filter for template accounts
        const templatesFilter = new VidiunPartnerFilter({});
        templatesFilter.statusIn = '1,2'; // active and blocked
        templatesFilter.partnerGroupTypeEqual = VidiunPartnerGroupType.template;

        // create filter for used accounts
        const accountsFilter = new VidiunPartnerFilter({});
        accountsFilter.statusIn = '1,2'; // active and blocked

        // update desired fields of partners
        const responseProfile: VidiunDetachedResponseProfile = new VidiunDetachedResponseProfile({
            type: VidiunResponseProfileType.includeFields,
            fields: 'id,name,status,adminName,website,createdAt,referenceId,adminEmail,phone,createdAt,adminUserId'
        });

      // build the request
      return this._vidiunClient.multiRequest(new VidiunMultiRequest(
          new PartnerListAction({ filter, pager }).setRequestOptions({ responseProfile }),
          new PartnerListAction({ filter: templatesFilter }).setRequestOptions({ responseProfile }),
          new PartnerListAction({ filter: accountsFilter }).setRequestOptions({ responseProfile })
      ));
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public updateAccountStatus(id: number, status: VidiunPartnerStatus): Observable<void> {
      return this._vidiunClient.request(new VarConsoleUpdateStatusAction({id, status}))
          .map(() => {
              return undefined;
          })
          .catch(error => {
              throw error;
          });
  }

  public getAdminSession(impersonatedPartnerId: number): Observable<string> {
      const loggedInUserId = this._appAuthentication.appUser.id;
      const requests = [
          new PartnerGetInfoAction({})
              .setRequestOptions({
                  vs: this._appAuthentication.appUser.vs
              }),
          new PartnerGetAction({ id: impersonatedPartnerId })
              .setRequestOptions({
              vs: this._appAuthentication.appUser.vs
          })];

      return this._vidiunClient.multiRequest(requests).switchMap(
          (responses: VidiunMultiResponse) => {
              if (responses.hasErrors()) {
                  throw new Error(`Error occur during session creation for partner ${impersonatedPartnerId}`);
              }
              return this._vidiunClient.request(new SessionImpersonateAction({
                  secret: responses[0].result.adminSecret,
                  userId: responses[1].result.adminUserId,
                  impersonatedPartnerId,
                  type: VidiunSessionType.admin,
                  partnerId: this._appAuthentication.appUser.partnerInfo.partnerId,
                  privileges: loggedInUserId !== responses[1].result.adminUserId ? `disableentitlement,enablechangeaccount:${impersonatedPartnerId}` : 'disableentitlement'

              })).map(response => {
                  const vs: string = response;
                  return vs;
              })
          }
      );
  }

  public addAccount(partner: VidiunPartner, templatePartnerId: number): Observable<VidiunPartner> {
      return this._vidiunClient.request(new PartnerRegisterAction({partner, templatePartnerId}));
  }

  public reload(): void {
    this._logger.info(`reloading accounts data`);
    if (this._accounts.state.getValue().loading) {
      this._logger.info(`reloading in progress, skip duplicating request`);
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }
}

