import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { CategoryUpdateAction } from 'vidiun-ngx-client';
import { VidiunCategory } from 'vidiun-ngx-client';
import { VidiunAppearInListType } from 'vidiun-ngx-client';

@Injectable()
export class CategoriesBulkChangeCategoryListingService extends CategoriesBulkActionBaseService<VidiunAppearInListType> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedCategories: VidiunCategory[], appearInListType : VidiunAppearInListType) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        let updatedCategory: VidiunCategory = new VidiunCategory();
        updatedCategory.appearInList  = appearInListType;
        requests.push(new CategoryUpdateAction({
          id: category.id,
          category: updatedCategory
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({})
          observer.complete();
        },
        error => {
          observer.error({});
        }
      );
    });
  }
}
