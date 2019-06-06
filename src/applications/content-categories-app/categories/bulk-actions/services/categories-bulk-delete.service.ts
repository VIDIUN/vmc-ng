import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoriesBulkActionBaseService } from './categories-bulk-action-base.service';
import { VidiunClient, VidiunCategory, CategoryDeleteAction} from 'vidiun-ngx-client';
import { CategoriesGraphUpdatedEvent } from 'app-shared/vmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { AppEventsService } from 'app-shared/vmc-shared';

@Injectable()
export class CategoriesBulkDeleteService extends CategoriesBulkActionBaseService<void> {

  constructor(_vidiunServerClient: VidiunClient, private _appEvents: AppEventsService) {
    super(_vidiunServerClient);
  }

  public execute(selectedCategories: VidiunCategory[]): Observable<void> {
      const requests = selectedCategories.map(category => new CategoryDeleteAction({ id: category.id }));
      return this.transmit(requests, true)
          .pipe(map(() => {
              this._appEvents.publish(new CategoriesGraphUpdatedEvent());
          }));
  }
}
