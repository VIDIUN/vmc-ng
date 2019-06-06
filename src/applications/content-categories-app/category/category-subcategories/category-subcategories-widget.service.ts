import {VidiunCategory} from 'vidiun-ngx-client';
import {Injectable, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import {VidiunUtils} from '@vidiun-ng/vidiun-common';
import {AppLocalization} from '@vidiun-ng/mc-shared';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {CategoryWidget} from '../category-widget';
import {VidiunCategoryFilter} from 'vidiun-ngx-client';
import {VidiunCategoryListResponse} from 'vidiun-ngx-client';
import {CategoryListAction} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunDetachedResponseProfile} from 'vidiun-ngx-client';
import {VidiunResponseProfileType} from 'vidiun-ngx-client';
import {VidiunCategoryOrderBy} from 'vidiun-ngx-client';
import {VidiunClient, VidiunMultiRequest} from 'vidiun-ngx-client';
import {CategoryUpdateAction} from 'vidiun-ngx-client';
import {BrowserService} from 'app-shared/vmc-shell';
import {CategoryDeleteAction} from 'vidiun-ngx-client';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CategoriesUtilsService} from '../../categories-utils.service';
import {CategoryService} from '../category.service';
import { modulesConfig } from 'config/modules';
import { globalConfig } from 'config/global';
import { ContentCategoryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class CategorySubcategoriesWidget extends CategoryWidget implements OnDestroy {
  private _subcategories = new BehaviorSubject<VidiunCategory[]>([]);
  public subcategories$ = this._subcategories.asObservable();
  private _subcategoriesMarkedForDelete: VidiunCategory[];

  constructor(private _vidiunClient: VidiunClient,
              private _browserService: BrowserService,
              private _categoriesUtilsService: CategoriesUtilsService,
              private _categoryService: CategoryService,
              private _appLocalization: AppLocalization,
              logger: VidiunLogger) {
    super(ContentCategoryViewSections.SubCategories, logger);
  }

  protected onActivate(firstTimeActivating: boolean) {
    if (this.data && !this.data.directSubCategoriesCount) {
      this._categoryService.openSection(ContentCategoryViewSections.Metadata);
      return;
    }


    super._showLoader();

    return this._loadSubcategories()
      .map(() => {
        super._hideLoader();
        return {failed: false};
      })
      .catch((error, caught) => {
        super._hideLoader();
        super._showActivationError();
        return Observable.of({failed: true, error});
      });
  }

  protected onReset() {
    this._subcategories.next([]);
  }


  private _loadSubcategories(): Observable<void> {
    return this._getSubcategories(this.data)
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .map(
        response => {
          this._subcategories.next(response.objects || []);
          this._subcategoriesMarkedForDelete = [];
          return undefined;
        }
      );
  }


  private _getSubcategories(parentCategory: VidiunCategory): Observable<VidiunCategoryListResponse> {
    const subcategoriesLimit: number = modulesConfig.contentShared.categories.subCategoriesLimit || globalConfig.client.views.tables.defaultPageSize;
    if (!parentCategory) {
      return Observable.throw(new Error('parentCategory to get subcategories for is not defined'));
    }
    if (parentCategory.directSubCategoriesCount > subcategoriesLimit) {
      return Observable.throw(new Error(`parent category subcategories count exceeds ${{subcategoriesLimit}} limit`));
    }
    try {
      const filter: VidiunCategoryFilter = new VidiunCategoryFilter({
        parentIdEqual: parentCategory.id,
        orderBy: VidiunCategoryOrderBy.partnerSortValueAsc.toString()
      });
      const pagination: VidiunFilterPager = new VidiunFilterPager(
        {
          pageSize: subcategoriesLimit,
          pageIndex: 1
        }
      );

      const responseProfile: VidiunDetachedResponseProfile = new VidiunDetachedResponseProfile({
        type: VidiunResponseProfileType.includeFields,
        fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, tags, partnerSortValue'
      });

      // build the request
      return <any>this._vidiunClient.request(
            new CategoryListAction({
                filter,
                pager: pagination
            }).setRequestOptions({
                responseProfile
            })
        );
    } catch (err) {
      return Observable.throw(err);
    }
  }

  public onActionSelected({action, subcategory}: { action: 'delete' | 'moveUp' | 'moveDown', subcategory: VidiunCategory }): void {
    switch (action) {
      case 'delete':
        this._deleteSubcategory(subcategory);
        break;
      case 'moveUp':
        this._moveUpSubcategories([subcategory]);
        break;
      case 'moveDown':
        this._moveDownSubcategories([subcategory]);
        break;
      default:
        break;
    }
  }

  private _deleteSubcategory(subcategory: VidiunCategory) {
    this._categoriesUtilsService.confirmDelete(subcategory, this._subcategories.getValue())
      .subscribe(confirmationResult => {
        if (confirmationResult.confirmed) {
          this._subcategories.getValue().splice(confirmationResult.categoryIndex, 1);
          this._subcategoriesMarkedForDelete.push(subcategory);
          this._setDirty();
          this._subcategories.next(this._subcategories.getValue());
        }
      }, error => {
        const deleteError = new AreaBlockerMessage({
          message: this._appLocalization.get('applications.content.categoryDetails.subcategories.errors.categoryCouldNotBeDeleted'),
          buttons: [{
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._removeBlockerMessage();
            }
          }]
        });
        this._showBlockerMessage(deleteError, false);
      });
  }

  public deleteSelectedSubcategories(subcategories: VidiunCategory[]): void {
    this._categoriesUtilsService.confirmDeleteMultiple(subcategories, this._subcategories.getValue())
      .subscribe(result => {
        if (result.confirmed) {
          setTimeout(() => { // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
            let deleted = false;
            subcategories.forEach((category) => {
              const selectedIndex = this._subcategories.getValue().indexOf(category);
              if (selectedIndex > -1) {
                this._subcategories.getValue().splice(selectedIndex, 1);
                this._subcategoriesMarkedForDelete.push(category);
                deleted = true;
              }
            });
            if (deleted) {
              this._subcategories.next(this._subcategories.getValue());
              this._setDirty();
            }
          }, 0);
        }
      }, error => {
        const deleteError = new AreaBlockerMessage({
          message: this._appLocalization.get('applications.content.categoryDetails.subcategories.errors.categoriesCouldNotBeDeleted'),
          buttons: [{
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._removeBlockerMessage();
            }
          }]
        });
        this._showBlockerMessage(deleteError, false);
      });
  }


  public moveSubcategories({items, direction}: { items: VidiunCategory[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpSubcategories(items);
    } else {
      this._moveDownSubcategories(items);
    }
  }

  private _moveUpSubcategories(selectedSubcategories: VidiunCategory[]): void {
    if (VidiunUtils.moveUpItems(this._subcategories.getValue(), selectedSubcategories)) {
        this._categoryService.notifySubcategoriesMoved();
      this._setDirty();
    }
  }

  private _moveDownSubcategories(selectedSubcategories: VidiunCategory[]): void {
    if (VidiunUtils.moveDownItems(this._subcategories.getValue(), selectedSubcategories)) {
        this._categoryService.notifySubcategoriesMoved();
      this._setDirty();
    }
  }

  protected onDataSaving(newData: VidiunCategory, request: VidiunMultiRequest): void {
    if (this.isDirty) {
      this._subcategoriesMarkedForDelete.forEach(subcategory => {
        request.requests.push(new CategoryDeleteAction({
          id: subcategory.id,
          moveEntriesToParentCategory: 1
        }));
      });
      this._subcategories.getValue().forEach((subcategory, index) => {
        request.requests.push(new CategoryUpdateAction({
          id: subcategory.id,
          category: new VidiunCategory({
            partnerSortValue: index
          })
        }));
      });
    }
  }

  private _setDirty(): void {
    this.updateState({isDirty: true});
  }


  public refresh() {
    super._showLoader();

    this._loadSubcategories()
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .subscribe(() => {
          super._hideLoader();
        },
        (error) => {
          super._hideLoader();

          this._showBlockerMessage(new AreaBlockerMessage(
            {
              message:
                this._appLocalization.get('applications.content.categoryDetails.subcategories.errors.applications.content.categoryDetails.subcategories.errors.subcategoriesLoadError'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.refresh();
                  }
                }
              ]
            }
          ), true);
        });
  }

  ngOnDestroy() {
  }

  public addSubcategoryToList({category}: {category: VidiunCategory}) {
    this._subcategories.next([...this._subcategories.getValue(), category]);
    this._categoryService.notifyChangesInCategory();
  }
}
