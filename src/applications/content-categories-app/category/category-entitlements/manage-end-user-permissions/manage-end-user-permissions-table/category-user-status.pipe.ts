import {Pipe, PipeTransform} from '@angular/core';
import {VidiunCategoryUserStatus} from 'vidiun-ngx-client';
import {AppLocalization} from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vCategoryUserStatus' })
export class CategoryUserStatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: VidiunCategoryUserStatus): string {
    switch (value) {
      case VidiunCategoryUserStatus.active:
        return this.appLocalization.get('app.common.yes');
        case VidiunCategoryUserStatus.notActive:
        return this.appLocalization.get('app.common.no');
      case VidiunCategoryUserStatus.pending:
        return this.appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.table.pendingApproval');
      default:
        return '';
    }
  }
}
