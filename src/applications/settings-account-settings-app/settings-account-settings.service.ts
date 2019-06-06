import {Injectable} from '@angular/core';
import {VidiunClient} from 'vidiun-ngx-client';
import { VidiunMultiRequest, VidiunRequest, VidiunRequestBase } from 'vidiun-ngx-client';
import {VidiunUserRoleFilter} from 'vidiun-ngx-client';
import {VidiunUserRoleStatus} from 'vidiun-ngx-client';
import {VidiunUserFilter} from 'vidiun-ngx-client';
import {VidiunNullableBoolean} from 'vidiun-ngx-client';
import {VidiunUserStatus} from 'vidiun-ngx-client';
import {UserRoleListAction} from 'vidiun-ngx-client';
import {UserListAction} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {VidiunPartner} from 'vidiun-ngx-client';
import {PartnerGetInfoAction} from 'vidiun-ngx-client';
import {PartnerUpdateAction} from 'vidiun-ngx-client';
import {VidiunUserListResponse} from 'vidiun-ngx-client';


export interface AccountSettings {
  website: string;
  name: string;
  adminUserId: string;
  phone: string;
  describeYourself: string;
  referenceId: string;
}

@Injectable()
export class SettingsAccountSettingsService {

  constructor(private _vidiunServerClient: VidiunClient) {
  }

  /** update the data for current partner */
  public updatePartnerData(data: AccountSettings): Observable<VidiunPartner> {
    const partner = new VidiunPartner({
      website: data.website,
      name: data.name,
      adminUserId: data.adminUserId,
      phone: data.phone,
      describeYourself: data.describeYourself,
      referenceId: data.referenceId
    });
    return this._vidiunServerClient.request(new PartnerUpdateAction({
      partner
    }));
  }


  /** Get the account owners list for current partner */
  public getPartnerAccountSettings(): Observable<any> {

    const userRoleFilter: VidiunUserRoleFilter = new VidiunUserRoleFilter({
      tagsMultiLikeOr: 'partner_admin',
      statusEqual: VidiunUserRoleStatus.active
    });

    const userFilter: VidiunUserFilter = new VidiunUserFilter({
      isAdminEqual: VidiunNullableBoolean.trueValue,
      loginEnabledEqual: VidiunNullableBoolean.trueValue,
      statusEqual: VidiunUserStatus.active,
      roleIdsEqual: '0'
    })
      .setDependency(['roleIdsEqual', 0, 'objects:0:id']);


    const multiRequest = new VidiunMultiRequest(
      new UserRoleListAction({filter: userRoleFilter}),
      new UserListAction({filter: userFilter}),
      new PartnerGetInfoAction()
    );

    return this._vidiunServerClient.multiRequest(multiRequest)
      .map(
        data => {
          if (data.hasErrors()) {
            throw new Error('error occurred in action \'getPartnerAccountSettings\'');
          }

          let accountOwners: {name: string, id: string }[] = [];
          let partnerData: VidiunPartner;
          data.forEach(response => {
            if (response.result instanceof VidiunUserListResponse) {
                const usersList = response.result.objects;
                accountOwners = usersList
                  .filter(({ fullName }) => fullName && fullName !== '')
                  .map(user => ({ name: user.fullName, id: user.id }));
                if (!accountOwners.length) {
                    throw new Error('error occurred in action \'getPartnerAccountSettings\'');
                }
            } else if (response.result instanceof VidiunPartner) {
              partnerData = response.result;
            }
          });
          return {accountOwners, partnerData};
        });
  }
}
