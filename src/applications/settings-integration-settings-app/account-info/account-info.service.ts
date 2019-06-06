import {Injectable} from '@angular/core';
import {VidiunClient} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {VidiunPartner} from 'vidiun-ngx-client';
import {PartnerGetInfoAction} from 'vidiun-ngx-client';

export interface AccountInfo {
  partnerId: number;
  subPartnerId: string;
  adminSecret: string;
  userSecret: string;
}

@Injectable()
export class AccountInfoService {

  constructor(private _vidiunServerClient: VidiunClient) {
  }

  /** Get the account owners list for current partner */
  public getAccountInfo(): Observable<AccountInfo> {


    return this._vidiunServerClient.request(new PartnerGetInfoAction())
      .map(
        (response: VidiunPartner) => {

          const accountInfo: AccountInfo = {
            partnerId: response.id,
            subPartnerId: response.id + '00',
            adminSecret: response.adminSecret,
            userSecret: response.secret
          };
          return accountInfo;
        });
  }
}
