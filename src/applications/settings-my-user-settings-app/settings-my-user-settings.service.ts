import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VidiunClient, VidiunMultiRequest, UserUpdateAction } from 'vidiun-ngx-client';
import { UserGetAction } from 'vidiun-ngx-client';
import { UserRoleGetAction } from 'vidiun-ngx-client';
import { UserUpdateLoginDataAction, UserUpdateLoginDataActionArgs } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunUser } from 'vidiun-ngx-client';
import { VidiunUserRole } from 'vidiun-ngx-client';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(private _vidiunServerClient: VidiunClient,
              private _appAuth: AppAuthentication,
              private _appLocalization: AppLocalization) {
  }

  public getUserData(): Observable<{ user: VidiunUser, role: VidiunUserRole }> {
    const request = new VidiunMultiRequest(
      new UserGetAction(),
      new UserRoleGetAction({ userRoleId: 0 })
        .setDependency(['userRoleId', 0, 'roleIds'])
    );

    return this._vidiunServerClient
      .multiRequest(request)
      .map(([user, role]) => {
        if (user.error || role.error) {
          throw new Error((user.error || role.error).message);
        }

        return {
          user: user.result,
          role: role.result
        };
      })
      .catch(() => {
        return Observable.throw(new Error(this._appLocalization.get('applications.settings.myUserSettings.errors.getUserData')));
      });
  }

  public updateEmail(user: VidiunUser): Observable<void> {
      return this._vidiunServerClient
          .request(new UserUpdateAction({ userId: user.id, user }))
          .pipe(
              catchError(error =>
                  throwError(new Error(this._appLocalization.get('applications.settings.myUserSettings.errors.updateUser')))
              ),
              map(() => {}),
          );
  }

  public updateLoginData(userData: UserUpdateLoginDataActionArgs): Observable<void> {
    return this._vidiunServerClient
      .request(new UserUpdateLoginDataAction(userData))
      .catch(error => {
        const message = error && error.message
          ? error.code === 'PASSWORD_STRUCTURE_INVALID'
            ? this._appLocalization.get('applications.settings.myUserSettings.errors.passwordStructure')
            : this._appLocalization.get('applications.settings.myUserSettings.errors.passwordErr')
          : this._appLocalization.get('applications.settings.myUserSettings.errors.updateUser');
        return Observable.throw(new Error(message));
      });
  }

  public updateUserNameManually(user: VidiunUser): void {
    if (user && user.firstName && user.lastName && user.fullName) {
      this._appAuth._updateNameManually(user.firstName, user.lastName, user.fullName);
    }
  }
}
