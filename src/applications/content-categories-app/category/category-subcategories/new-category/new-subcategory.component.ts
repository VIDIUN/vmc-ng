import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {VidiunCategory} from 'vidiun-ngx-client';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {CategoriesService} from '../../../categories/categories.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vNewSubcategory',
  templateUrl: './new-subcategory.component.html',
  styleUrls: ['./new-subcategory.component.scss']
})
export class NewSubcategoryComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryParentId: number;
  @Output() onSubCategoryAdded = new EventEmitter<{category: VidiunCategory}>();

  public _blockerMessage: AreaBlockerMessage = null;
  public newCategoryForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _categoriesService: CategoriesService) {
  }

  ngOnInit() {
    if (!this.categoryParentId) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.unableToLoadParentCategoryId'),
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
    }
    this.newCategoryForm = this._fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy() {

  }

  public _apply(): void {
    this._blockerMessage = null;
    this._createNewCategory(this.categoryParentId);
  }

  private _createNewCategory(categoryParentId: number) {
    const categoryName = this.newCategoryForm.controls['name'].value;
    if (!categoryName || !categoryName.length) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.requiredName'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._blockerMessage = null;
            }
          }
        ]
      });
    } else {
      this._categoriesService.addNewCategory({categoryParentId: categoryParentId, name: categoryName})
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .subscribe(({category}: {category: VidiunCategory}) => {
            this.onSubCategoryAdded.emit({category});
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage(
              {
                message: error.message,
                buttons: [
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
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
