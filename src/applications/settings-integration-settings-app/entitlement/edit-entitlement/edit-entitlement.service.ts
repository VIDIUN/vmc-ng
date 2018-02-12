import {Injectable} from '@angular/core';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {CategoryUpdateAction} from "kaltura-ngx-client/api/types/CategoryUpdateAction";

export interface Entitlement {
  categories: KalturaCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EditEntitlementService {


  constructor(private _kalturaServerClient: KalturaClient) {
  }


  public updateEntitlementPrivacyContext(id: number, privacyContextLabel: string): Observable<void> {

    return this._kalturaServerClient.request(new CategoryUpdateAction({
      id,
      category: new KalturaCategory({
        privacyContext: privacyContextLabel
      })
    }))
      .map(_ => (undefined));
  }
}
