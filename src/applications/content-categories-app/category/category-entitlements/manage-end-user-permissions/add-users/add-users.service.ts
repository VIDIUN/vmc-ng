import {Injectable} from '@angular/core';
import {VidiunClient, VidiunMultiRequest} from 'vidiun-ngx-client';
import {UserListAction} from 'vidiun-ngx-client';
import {VidiunUserFilter} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunCategoryUserPermissionLevel} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {VidiunUpdateMethodType} from 'vidiun-ngx-client';
import {CategoryUserAddAction} from 'vidiun-ngx-client';
import {VidiunCategoryUser} from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {CategoryUserCopyFromCategoryAction} from 'vidiun-ngx-client';
import 'rxjs/add/operator/delay';

@Injectable()
export class AddUsersService {

  constructor(private _vidiunServerClient: VidiunClient,
              private _appLocalization: AppLocalization) {
  }


  public addUsers({usersIds, categoryId, permissionLevel, updateMethod}: { usersIds: string[], categoryId: number, permissionLevel: VidiunCategoryUserPermissionLevel, updateMethod: VidiunUpdateMethodType}): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw(
        new Error(this._appLocalization
          .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.missingUsers')));
    }

    const multiRequest = new VidiunMultiRequest();
    usersIds.forEach(userId => {
      const categoryUser = new VidiunCategoryUser({
        categoryId,
        userId,
        permissionLevel,
        updateMethod
      });
      multiRequest.requests.push(new CategoryUserAddAction({categoryUser}));
    });

    return this._vidiunServerClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            const errorMessage = (response.find(r => (r.error && r.error.code !== 'CATEGORY_USER_ALREADY_EXISTS'))) ?
                'applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.addUsersFailed':
                'applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.duplicateUsers';
            throw new Error(this._appLocalization.get(errorMessage));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }



  public copyUsersFromParent({categoryId}: {categoryId: number}): Observable<void> {
    return this._vidiunServerClient.request(
      new CategoryUserCopyFromCategoryAction({categoryId})
    ).delay(6000); // we delay the response for the server to be able to index the new users
  }


  public getUsersSuggestions(query: string) {
    return this._vidiunServerClient.request(
      new UserListAction(
        {
          filter: new VidiunUserFilter({
            idOrScreenNameStartsWith: query
          }),
          pager: new VidiunFilterPager({
            pageIndex: 0,
            pageSize: 30
          })
        }
      )
    );
  }
}
