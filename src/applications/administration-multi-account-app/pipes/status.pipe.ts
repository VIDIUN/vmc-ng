import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunPartnerStatus } from 'vidiun-ngx-client';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let userStatus: string = '';

    if (typeof value !== 'undefined' && value !== null) {
      switch (value.toString()) {
        case VidiunPartnerStatus.active.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.active');
          break;
        case VidiunPartnerStatus.blocked.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.blocked');
          break;
        case VidiunPartnerStatus.fullBlock.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.removed');
          break;
      }
    }
    return userStatus;
  }
}
