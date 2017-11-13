import {Component, Input, OnInit} from '@angular/core';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService} from '../categories.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoryData} from 'app-shared/content-shared/categories-search.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';

@Component({
  selector: 'kMoveCategory',
  templateUrl: './move-category.component.html',
  styleUrls: ['./move-category.component.scss']
})
export class MoveCategoryComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryToMove: KalturaCategory;

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: CategoryData = null;

  constructor(  private _categoriesService: CategoriesService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) { }

  ngOnInit() {
    if (!this.categoryToMove) {
      console.warn('CategoryParentSelectorComponent: move category was selected without setting category Id to move');
    }
  }

  public _onCategorySelected(event: CategoryData) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    if (this._validateCategoryMove(this._selectedParentCategory)) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.moveCategory'),
          message: this._appLocalization.get('applications.content.moveCategory.treeUpdateNotification'),
          accept: () => {
            this._isBusy = true;
            this._blockerMessage = null;
            this._moveCategory(this._selectedParentCategory);
          }
        }
      );
    }
  }

  private _moveCategory(categoryParent: CategoryData) {
    this._categoriesService
      .moveCategory({category: this.categoryToMove, categoryParent: {id: categoryParent.id, fullIds: categoryParent.fullIdPath}})
      .subscribe(result => {
          this._isBusy = false;
          if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
          }
        },
        error => {
          this._isBusy = false;
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.content.moveCategory.errors.categoryMovedFailure'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._moveCategory(categoryParent);
                }
              },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
        });
  }

  private _validateCategoryMove(selectedCategoryParent: CategoryData) {
    // if category moved to the same parent or to 'no parent' as it was before
    if (!selectedCategoryParent && !this.categoryToMove.parentId ||
        selectedCategoryParent && this.categoryToMove.parentId === selectedCategoryParent.id) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
      return false;
    } else if (selectedCategoryParent && !this._categoriesService.isParentCategorySelectionValid(
          {category: this.categoryToMove, categoryParent: {id: selectedCategoryParent.id, fullIds: selectedCategoryParent.fullIdPath}})) {
      // if trying to move category be a child of itself or one of its children show error message
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.invalidParentSelection'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
      return false;
    }

    return true;
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
