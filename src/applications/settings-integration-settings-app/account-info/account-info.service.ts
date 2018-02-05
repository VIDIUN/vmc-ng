import {Injectable} from '@angular/core';
import {KalturaClient} from 'kaltura-ngx-client';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaPartner} from 'kaltura-ngx-client/api/types/KalturaPartner';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';

export interface AccountInfo {
  partnerId: number;
  subPartnerId: string;
  adminSecret: string;
  userSecret: string;
}

@Injectable()
export class AccountInfoService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  /** Get the account owners list for current partner */
  public getAccountInfo(): Observable<AccountInfo> {


    return this._kalturaServerClient.request(new PartnerGetInfoAction())
      .monitor('get account info')
      .map(
        (response: KalturaPartner) => {

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
