import {Injectable} from '@angular/core';
import {VidiunClient} from 'vidiun-ngx-client';
import {VidiunCategory} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {CategoryUpdateAction} from 'vidiun-ngx-client';

export interface Entitlement {
  categories: VidiunCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EditEntitlementService {


  constructor(private _vidiunServerClient: VidiunClient) {
  }


  public updateEntitlementPrivacyContext(id: number, privacyContextLabel: string): Observable<void> {

    return this._vidiunServerClient.request(new CategoryUpdateAction({
      id,
      category: new VidiunCategory({
        privacyContext: privacyContextLabel
      })
    }))
      .map(_ => (undefined));
  }
}
