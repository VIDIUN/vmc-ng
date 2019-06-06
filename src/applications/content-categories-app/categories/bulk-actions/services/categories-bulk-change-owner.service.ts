import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {VidiunClient} from 'vidiun-ngx-client';
import {VidiunUser} from 'vidiun-ngx-client';
import {CategoriesBulkActionBaseService} from './categories-bulk-action-base.service';
import {CategoryUpdateAction} from 'vidiun-ngx-client';
import {VidiunCategory} from 'vidiun-ngx-client';

@Injectable()
export class CategoriesBulkChangeOwnerService extends CategoriesBulkActionBaseService<VidiunUser> {

  constructor(_vidiunServerClient: VidiunClient) {
    super(_vidiunServerClient);
  }

  public execute(selectedCategories: VidiunCategory[], owner: VidiunUser): Observable<{}>{
    return Observable.create(observer => {

      const requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        const updatedCategory: VidiunCategory = new VidiunCategory();
        updatedCategory.owner = owner.id;
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
