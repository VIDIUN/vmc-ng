import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { CategoriesService } from '../categories.service';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell';
import { VidiunCategory } from 'vidiun-ngx-client';
import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { SelectedCategory } from 'app-shared/content-shared/categories/category-selector/category-selector.component';
import { Observable } from 'rxjs';
import { CategoriesGraphUpdatedEvent } from 'app-shared/vmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { AppEventsService } from 'app-shared/vmc-shared';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vMoveCategory',
  templateUrl: './move-category.component.html',
  styleUrls: ['./move-category.component.scss'],
    providers: [VidiunLogger.createLogger('MoveCategoryComponent')]
})
export class MoveCategoryComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() selectedCategories: VidiunCategory[];
  @Output() onMovedCategories = new EventEmitter<null>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: SelectedCategory = 'missing';
  public _categoriesUpdating = false;

  constructor(private _categoriesService: CategoriesService,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
              private _logger: VidiunLogger) {
  }

  ngOnInit() {
    this._categoriesStatusMonitorService.status$
	    .pipe(cancelOnDestroy(this))
	    .subscribe((status: CategoriesStatus) => {
          this._categoriesUpdating = status.update;
        });

    if (!this.selectedCategories || !this.selectedCategories.length) {
      this._blockerMessage = new AreaBlockerMessage(
        {
          message: this._appLocalization.get('applications.content.moveCategory.errors.unableToMove'),
          buttons: [
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._blockerMessage = null;
                if (this.parentPopupWidget) {
                  this.parentPopupWidget.close();
                }
              }
            }
          ]
        });
      console.warn('CategoryParentSelectorComponent: move category was selected without setting category Id to move');
    }
  }

  ngOnDestroy() {
  }

  public _onCategorySelected(event: number) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
      this._logger.info(`handle move category action by user`);
    if (this._selectedParentCategory === 'missing') {
        this._logger.info(`parent category is missing, show alert, abort action`);
      this._browserService.alert({
        header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.moveCategory.noCategorySelected')
      });
      return;
    }

    this._logger.info(`validate categories to move`);
    Observable.from(this.selectedCategories)
      .switchMap(category => this._validateCategoryMove(category))
      .toArray()
      .subscribe(
        validatedCategories => {
          const allValid = validatedCategories.every(Boolean);
          if (allValid) {
              this._logger.info(`handle successful validation, show alert`);
            this._browserService.confirm({
              header: this._appLocalization.get('applications.content.categories.moveCategory'),
              message: this._appLocalization.get('applications.content.moveCategory.treeUpdateNotification'),
              accept: () => {
                  this._logger.info(`user confirmed, proceed action`);
                this._blockerMessage = null;
                this._moveCategory();
              }
            });
          }
        },
        error => {
            this._logger.info(`handle failed validation, show alert`, { errorMessage: error.message });
          this._browserService.confirm({
            header: this._appLocalization.get('app.common.error'),
            message: error.message || this._appLocalization.get('applications.content.moveCategory.errors.failedToLoadParentCategoryData'),
            accept: () => {
                this._logger.info(`user dismissed alert`);
              this._blockerMessage = null;
            }
          });
        });
  }

  private _getCategoryParentData(): Observable<{ id?: number, fullIds: number[] }> {
    return Observable.create(observer => {
      const hasSelectedParent = this._selectedParentCategory && this._selectedParentCategory !== 'missing';

      if (!hasSelectedParent) {
        observer.next({ id: 0, fullIds: [] });
        observer.complete();
        return;
      }

      this._categoriesService.getCategoryById(<number>this._selectedParentCategory)
        .subscribe(
          category => {
            observer.next({ id: category.id, fullIds: category.fullIdPath });
            observer.complete();
          },
          error => {
            observer.error(error);
          });
    });
  }

  private _moveCategory() {
      this._logger.info(`handle move category request, load category parent data`);
    this._getCategoryParentData()
      .switchMap(categoryParent => this._categoriesService.moveCategory({ categories: this.selectedCategories, categoryParent }))
      .pipe(tag('block-shell'))
      .pipe(cancelOnDestroy(this))
      .subscribe(() => {
              this._logger.info(`handle successful move category request`);
          this.onMovedCategories.emit();
          this._appEvents.publish(new CategoriesGraphUpdatedEvent());
          this._categoriesStatusMonitorService.updateCategoriesStatus();
          this._categoriesService.reload();
          if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
          }
        },
        error => {
            this._logger.warn(`handle failed move category request, show confirmation`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.content.moveCategory.errors.categoryMovedFailure'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                    this._logger.info(`user confirmed, retry request`);
                  this._moveCategory();
                }
              },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                      this._logger.info(`user didn't confirm, abort request`);
                    this._blockerMessage = null;
                  }
                }
              ]
            });
        });
  }

  private _validateCategoryMove(categoryToMove: VidiunCategory) {
    if (this._selectedParentCategory === 'missing') {
      return Observable.of(false);
    }

    // if category moved to the same parent or to 'no parent' as it was before
    const sameParent = categoryToMove.parentId === this._selectedParentCategory || (!categoryToMove.parentId && this._selectedParentCategory === null);
    if (sameParent) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [{
          label: this._appLocalization.get('app.common.cancel'),
          action: () => {
            this._blockerMessage = null;
          }
        }]
      });
      return Observable.of(false);
    }

    if (this._selectedParentCategory === null) { // no parent selected
      return Observable.of(true);
    }

    return this._categoriesService.getCategoryById(<number>this._selectedParentCategory)
      .map(selectedParent => {
        return this._categoriesService.isParentCategorySelectionValid(
          {
            categories: this.selectedCategories,
            categoryParent: { id: selectedParent.id, fullIds: selectedParent.fullIdPath }
          });
      })
      .do(isParentCategorySelectionValid => {
        if (!isParentCategorySelectionValid) {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.moveCategory.errors.invalidParentSelection'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
        }
      });
  }


  public _cancel(): void {
      this._logger.info(`handle cancel action by user`);
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
