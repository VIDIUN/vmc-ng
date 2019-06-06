import { Pipe, PipeTransform } from '@angular/core';
import { VidiunUser } from 'vidiun-ngx-client';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'accountOwner' })
export class AccountOwnerPipe implements PipeTransform {
  constructor(private _appAuthentication: AppAuthentication, private _appLocalization: AppLocalization) {
  }

  transform(user: VidiunUser): string {
    let userAdditionalData = '';

    if (this._appAuthentication.appUser.id === user.id) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.you')}`;
    } else if (user.isAccountOwner) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.accountOwner')}`;
    }
    if (this._appAuthentication.appUser.id === user.id && user.isAccountOwner) {
      userAdditionalData = `${this._appLocalization.get('applications.administration.users.you')}, ${this._appLocalization.get('applications.administration.users.accountOwner')}`;
    }

    return userAdditionalData;
  }
}
