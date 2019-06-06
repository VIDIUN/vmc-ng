import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunModerationFlagType } from 'vidiun-ngx-client';

@Pipe({ name: 'vFlagType' })
export class FlagTypePipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let flagType = '';
    if (value) {
      switch (value.toString()) {
        case VidiunModerationFlagType.sexualContent.toString():
          flagType = this.appLocalization.get('applications.content.moderation.sexualContent');
          break;
        case VidiunModerationFlagType.harmfulDangerous.toString():
          flagType = this.appLocalization.get('applications.content.moderation.harmfulOrDangerousAct');
          break;
        case VidiunModerationFlagType.spamCommercials.toString():
          flagType = this.appLocalization.get('applications.content.moderation.spamOrCommercials');
          break;
        case VidiunModerationFlagType.violentRepulsive.toString():
          flagType = this.appLocalization.get('applications.content.moderation.violentOrRepulsive');
          break;
      }
    }
    return flagType;
  }
}
