import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategoryListResponse} from 'kaltura-ngx-client/api/types/KalturaCategoryListResponse';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {CategoryDeleteAction} from 'kaltura-ngx-client/api/types/CategoryDeleteAction';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoryMoveAction} from "kaltura-ngx-client/api/types/CategoryMoveAction";
import {CategoryAddAction} from "kaltura-ngx-client/api/types/CategoryAddAction";
import {KalturaInheritanceType} from "kaltura-ngx-client/api/types/KalturaInheritanceType";
import {KalturaContributionPolicyType} from "kaltura-ngx-client/api/types/KalturaContributionPolicyType";
import {KalturaAppearInListType} from "kaltura-ngx-client/api/types/KalturaAppearInListType";
import {KalturaPrivacyType} from "kaltura-ngx-client/api/types/KalturaPrivacyType";
import {KalturaMediaEntry} from "kaltura-ngx-client/api/types/KalturaMediaEntry";
import {KalturaCategoryEntry} from "kaltura-ngx-client/api/types/KalturaCategoryEntry";
import {CategoryEntryAddAction} from "kaltura-ngx-client/api/types/CategoryEntryAddAction";

export interface UpdateStatus {
  loading: boolean;
  errorMessage: string;
}

export interface Categories {
  items: KalturaCategory[],
  totalCount: number
}

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex: number,
  pageSize: number,
  sortBy: string,
  sortDirection: SortDirection,
  fields: string
}

export interface MoveCategoryData {
  categories: KalturaCategory[];
  categoryParent: { id?: number, fullIds: number[] };
}

export interface NewCategoryData {
  categoryParentId?: number;
  name: string;
  linkedEntries?: KalturaMediaEntry[]
}

@Injectable()
export class CategoriesService implements OnDestroy {

  private _categories = new BehaviorSubject<Categories>({items: [], totalCount: 0});
  private _state = new BehaviorSubject<UpdateStatus>({loading: false, errorMessage: null});
  private _categoriesExecuteSubscription: ISubscription;
  private _queryData = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc,
    fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, fullName,tags, fullIds, parentId'
  });

  public state$ = this._state.asObservable();
  public categories$ = this._categories.asObservable();
  public queryData$ = this._queryData.asObservable();

  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    const defaultPageSize = this.browserService.getFromLocalStorage('categories.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
    this.reload(false);
  }

  ngOnDestroy() {
    this._state.complete();
    this._queryData.complete();
    this._categories.complete();
    if (this._categoriesExecuteSubscription) {
      this._categoriesExecuteSubscription.unsubscribe();
      this._categoriesExecuteSubscription = null;
    }
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._categories.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._executeQuery();
    }
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._queryData.getValue(), partialData);
    this._queryData.next(newQueryData);

    if (partialData.pageSize) {
      this.browserService.setInLocalStorage('categories.list.pageSize', partialData.pageSize);
    }
  }

  public getNextCategoryId(categoryId: number): number | null {
    const categories = this._categories.getValue().items;
    if (!categories || !categories.length) {
      return null;
    }

    // validate category exists
    const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
    if (currentCategoryIndex === -1) {
      return null;
    }

    // get next category ID
    if (currentCategoryIndex < categories.length - 1) {
      return (categories[currentCategoryIndex + 1].id);
    } else {
      return null;
    }
  }

  public getPrevCategoryId(categoryId: number): number | null {
    const categories = this._categories.getValue().items;
    if (!categories || !categories.length) {
      return null;
    }

    // validate category exists
    const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
    if (currentCategoryIndex === -1) {
      return null;
    }

    // get previous category ID
    if (currentCategoryIndex !== 0) {
      return (categories[currentCategoryIndex - 1].id);
    } else {
      return null;
    }
  }

  private _executeQuery(): void {
    // cancel previous requests
    if (this._categoriesExecuteSubscription) {
      this._categoriesExecuteSubscription.unsubscribe();
    }

    this.browserService.scrollToTop();

    this._state.next({loading: true, errorMessage: null});

    // execute the request
    this._categoriesExecuteSubscription = this.buildQueryRequest(this._queryData.getValue()).subscribe(
      response => {
        this._categoriesExecuteSubscription = null;

        this._state.next({loading: false, errorMessage: null});

        this._categories.next({
          items: response.objects,
          totalCount: <number>response.totalCount
        });
      },
      error => {
        this._categoriesExecuteSubscription = null;
        const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
        this._state.next({loading: false, errorMessage});
      });
  }

  private buildQueryRequest(queryData: QueryData): Observable<KalturaCategoryListResponse> {
    try {
      const filter: KalturaCategoryFilter = new KalturaCategoryFilter({});
      let pagination: KalturaFilterPager = null;
      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: queryData.fields
      });

      // update pagination args
      if (queryData.pageIndex || queryData.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: queryData.pageSize,
            pageIndex: queryData.pageIndex
          }
        );
      }

      // update the sort by args
      if (queryData.sortBy) {
        filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
      }

      // build the request
      return <any>this._kalturaClient.request(
        new CategoryListAction({
          filter,
          pager: pagination,
          responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public deleteCategory(categoryId: number): Observable<void> {

    return Observable.create(observer => {
      let subscription: ISubscription;
      if (categoryId && categoryId > 0) {
        subscription = this._kalturaClient.request(new CategoryDeleteAction({id: categoryId})).subscribe(
          result => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
      } else {
        observer.error(new Error('missing categoryId argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }


  /**
   * Add new category to be existed under parent given as parameter
   * @param newCategoryData {NewCategoryData} holds name and desired categoryParentId (if null - move to root)
   * @return {Observable<number>} new category ID
   */
  public addNewCategory(newCategoryData: NewCategoryData): Observable<{categoryId: number}> {
    if (!newCategoryData || !newCategoryData.name) {
      const nameRequiredErrorMessage = this._appLocalization.get('applications.content.addNewCategory.errors.requiredName');
      return Observable.throw(new Error(nameRequiredErrorMessage));
    }
    const category = new KalturaCategory({
      name: newCategoryData.name,
      parentId: newCategoryData.categoryParentId || 0,
      privacy: KalturaPrivacyType.all,
      appearInList: KalturaAppearInListType.partnerOnly,
      contributionPolicy: KalturaContributionPolicyType.all,
      inheritanceType: KalturaInheritanceType.manual
    });

    const multiRequest: KalturaMultiRequest = new KalturaMultiRequest(
      new CategoryAddAction({category})
    );

    if (newCategoryData.linkedEntries) {
      newCategoryData.linkedEntries.forEach((entry) => {
        const categoryEntry = new KalturaCategoryEntry({
          entryId: entry.id
        }).setDependency(['categoryId', 0, 'id']);

        multiRequest.requests.push(
          new CategoryEntryAddAction({categoryEntry})

        );
      });
    }

    return this._kalturaClient.multiRequest(multiRequest)
      .map(
        data => {
          if (data.hasErrors()) {
            throw new Error('error occurred while trying to add new category');
          }
          return {categoryId: data[0].result.id};
        })
      .catch(error => {
        throw new Error('error occurred while trying to add new category');
      });
  }

  /**
   * Move category to be existed under new parent
   * @param moveCategoryData {MoveCategoryData} holds category to move ID and selected category parent (if null - move to root)
   * @return {Observable<void>}
   */
  public moveCategory(moveCategoryData: MoveCategoryData): Observable<void> {
    if (!moveCategoryData || !this.isParentCategorySelectionValid(moveCategoryData)) {
      const categoryMovedFailureErrorMessage = this._appLocalization.get('applications.content.moveCategory.errors.categoryMovedFailure');
      return Observable.throw(new Error(categoryMovedFailureErrorMessage));
    }

    return <any>this._kalturaClient.request(
      new CategoryMoveAction({
        categoryIds: moveCategoryData.categories.map(category => (category.id)).join(','),
        targetCategoryParentId: moveCategoryData.categoryParent ? moveCategoryData.categoryParent.id : 0
      })
    ).map(categoryMoved => (undefined));
  }

  /**
   * Check if selected category can be assigned under the target category parent
   * @param moveCategoryData {MoveCategoryData} contains category and its selected parent
   * @return {boolean}
   */
  public isParentCategorySelectionValid(moveCategoryData: MoveCategoryData): boolean {

    const isValid = (category) => {
      // Only siblings are allowed to be moved
      if (!category || !category.id || !category.fullIds || category.parentId !== moveCategoryData.categories[0].parentId) {
        console.log('[CategoriesService.isParentCategorySelectionValid] invalid category');
        return false;
      }
      // Check if we put the category as a descendant of itself
      const selectedCategoryIdSameAsParent = moveCategoryData.categoryParent &&
        category.id === moveCategoryData.categoryParent.id;

      // Check that the parent category isn't a descendant of the category
      const selectedParentIsDescendantOfCategoryToMove =
        moveCategoryData.categoryParent.fullIds.includes(category.id);
      return !selectedCategoryIdSameAsParent && !selectedParentIsDescendantOfCategoryToMove;
    };


    if (!moveCategoryData || !moveCategoryData.categories || !moveCategoryData.categories.length) {
      console.log('[CategoriesService.isParentCategorySelectionValid] invalid categories parameter');
      return false;
    }

    return moveCategoryData.categories.every(isValid);
  }
}

